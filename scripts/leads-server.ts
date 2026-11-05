// Serveur local des demandes RESTUP (développement et recette).
// POST /api/leads : validation serveur, limite de débit, idempotence, stockage SQLite durable
// et file de notifications traitée avec reprises bornées. Les e-mails sont déposés dans un
// collecteur local (dossier outbox) : aucun envoi externe.
//
// Lancement : npm run leads:server   (Node >= 22.18, sans dépendance)
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { validate, normalize, type Allowlist } from '../src/lib/leads/schema.ts';

const env = process.env;
const PORT = Number(env.LEADS_PORT ?? 8787);
const DB_PATH = env.LEADS_DB ?? '.data/leads.sqlite';
const OUTBOX = env.LEADS_OUTBOX ?? '.data/outbox';
const ORIGINS = (env.LEADS_ALLOWED_ORIGINS ?? 'http://localhost:4321').split(',').map((o) => o.trim());
const MODE = env.RESTUP_MODE === 'production' ? 'production' : 'preview';
const MAX_BODY = 16 * 1024;
const RATE_MAX = Number(env.LEADS_RATE_MAX ?? 5);
const RATE_WINDOW_MS = Number(env.LEADS_RATE_WINDOW_MS ?? 10 * 60_000);
const NOTIFY_EVERY_MS = Number(env.NOTIFY_INTERVAL_MS ?? 2_000);
const NOTIFY_MAX_ATTEMPTS = Number(env.NOTIFY_MAX_ATTEMPTS ?? 5);
const INTERNAL_TO = env.NOTIFY_INTERNAL_TO ?? 'equipe@restup.test';
const FROM = env.NOTIFY_FROM ?? 'RESTUP <no-reply@restup.test>';

// Liste blanche : mêmes règles de publication que les pages (catalogue + mode).
interface CatalogueService {
  id: string;
  serviceStatus: string;
}
const catalogue = JSON.parse(readFileSync(new URL('../src/data/catalogue.json', import.meta.url), 'utf8')) as {
  divisions: Array<{ slug: string; name: string; services: CatalogueService[] }>;
};
export const allow: Allowlist = {
  divisions: catalogue.divisions.map((d) => ({
    slug: d.slug,
    services: d.services.filter((s) => MODE === 'preview' || s.serviceStatus === 'approved').map((s) => s.id),
  })),
};
const divisionName = (slug?: string) => catalogue.divisions.find((d) => d.slug === slug)?.name;

// Base durable
mkdirSync(dirname(DB_PATH), { recursive: true });
mkdirSync(OUTBOX, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    body_hash TEXT NOT NULL,
    form_type TEXT NOT NULL,
    data TEXT NOT NULL,
    origin TEXT NOT NULL,
    created_at TEXT NOT NULL,
    commercial_status TEXT NOT NULL DEFAULT 'nouveau'
      CHECK (commercial_status IN ('nouveau','en cours','qualifié','non qualifié','clôturé'))
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('internal','ack')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT NOT NULL,
    last_error TEXT,
    UNIQUE (lead_id, kind)
  );
  CREATE TABLE IF NOT EXISTS status_history (
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_at TEXT NOT NULL,
    changed_by TEXT NOT NULL
  );
`);

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const now = () => new Date().toISOString();

// Limite de débit par adresse (empreinte, jamais l'adresse en clair)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const key = hash(ip);
  const t = Date.now();
  const recent = (hits.get(key) ?? []).filter((x) => t - x < RATE_WINDOW_MS);
  recent.push(t);
  hits.set(key, recent);
  return recent.length > RATE_MAX;
}

function send(res: ServerResponse, status: number, body: object, headers: Record<string, string> = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const insertLead = db.prepare(
  `INSERT INTO leads (id, idempotency_key, body_hash, form_type, data, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
);
const insertNotification = db.prepare(
  `INSERT INTO notifications (id, lead_id, kind, next_attempt_at) VALUES (?, ?, ?, ?)`
);
const insertHistory = db.prepare(`INSERT INTO status_history VALUES (?, 'nouveau', ?, 'site')`);
const findByKey = db.prepare(`SELECT id, body_hash FROM leads WHERE idempotency_key = ?`);

/** Enregistre la demande et ses notifications dans une seule transaction. */
function store(key: string, bodyHash: string, lead: ReturnType<typeof normalize>, origin: string) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const existing = findByKey.get(key) as { id: string; body_hash: string } | undefined;
    if (existing) {
      db.exec('COMMIT');
      return existing.body_hash === bodyHash ? { status: 200, id: existing.id } : { status: 409 };
    }
    const id = randomUUID();
    const t = now();
    insertLead.run(id, key, bodyHash, lead.formType, JSON.stringify(lead), origin, t);
    insertNotification.run(randomUUID(), id, 'internal', t);
    insertNotification.run(randomUUID(), id, 'ack', t);
    insertHistory.run(id, t);
    db.exec('COMMIT');
    return { status: 201, id };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  const cors: Record<string, string> = ORIGINS.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        Vary: 'Origin',
      }
    : {};

  if (req.url === '/api/health') return send(res, 200, { ok: true, mode: MODE });
  if (req.url !== '/api/leads') return send(res, 404, { error: 'not_found' });
  if (req.method === 'OPTIONS') {
    res.writeHead(ORIGINS.includes(origin) ? 204 : 403, cors);
    return res.end();
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' }, cors);
  if (!ORIGINS.includes(origin)) return send(res, 403, { error: 'origin' });
  if (!String(req.headers['content-type']).startsWith('application/json')) {
    return send(res, 415, { error: 'content_type' }, cors);
  }
  if (limited(req.socket.remoteAddress ?? '')) {
    return send(res, 429, { error: 'rate_limited' }, { ...cors, 'Retry-After': String(RATE_WINDOW_MS / 1000) });
  }

  const key = String(req.headers['idempotency-key'] ?? '');
  if (!/^[A-Za-z0-9-]{8,100}$/.test(key)) return send(res, 422, { errors: { idempotencyKey: 'invalid' } }, cors);

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(await readBody(req));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('shape');
  } catch (err) {
    const tooLarge = (err as Error).message === 'too_large';
    return send(res, tooLarge ? 413 : 400, { error: tooLarge ? 'too_large' : 'bad_json' }, cors);
  }
  if (typeof raw.website === 'string' && raw.website.trim()) {
    return send(res, 422, { errors: { form: 'invalid' } }, cors); // champ piège
  }

  const errors = validate(raw, allow);
  if (Object.keys(errors).length) {
    return send(res, 422, { errors: Object.fromEntries(Object.keys(errors).map((k) => [k, 'invalid'])) }, cors);
  }
  const lead = normalize(raw);
  try {
    const result = store(key, hash(JSON.stringify(lead)), lead, origin);
    if (result.status === 409) return send(res, 409, { error: 'idempotency_conflict' }, cors);
    return send(res, result.status, { id: result.id }, cors);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', event: 'store_failed', message: (err as Error).message }));
    return send(res, 503, { error: 'unavailable' }, cors);
  }
});

// ---- File de notifications ----------------------------------------------------------------

const due = db.prepare(
  `SELECT n.id, n.kind, n.attempts, l.form_type, l.data FROM notifications n JOIN leads l ON l.id = n.lead_id
   WHERE n.status = 'pending' AND n.next_attempt_at <= ? ORDER BY n.next_attempt_at LIMIT 20`
);
// Réservation atomique : deux traitements concurrents ne peuvent pas envoyer la même notification.
const claim = db.prepare(`UPDATE notifications SET status = 'processing' WHERE id = ? AND status = 'pending'`);
const markSent = db.prepare(
  `UPDATE notifications SET status = 'sent', attempts = attempts + 1, last_error = NULL WHERE id = ?`
);
const markRetry = db.prepare(
  `UPDATE notifications SET status = ?, attempts = attempts + 1, next_attempt_at = ?, last_error = ? WHERE id = ?`
);

function compose(kind: string, formType: string, data: Record<string, string>) {
  if (kind === 'internal') {
    return {
      to: INTERNAL_TO,
      subject: 'Nouvelle demande RESTUP',
      text: 'Une nouvelle demande a été enregistrée. Consultez-la dans votre outil de suivi sécurisé.',
    };
  }
  const topic =
    formType === 'diagnostic' ? (divisionName(data.need) ?? 'votre projet') : (data.subject ?? 'votre message');
  return {
    to: data.email,
    subject: 'RESTUP · Votre demande a bien été reçue',
    text: `Bonjour,\n\nNous avons reçu votre demande concernant ${topic}. Nous allons examiner les éléments transmis et vous recontacter à l’adresse indiquée.\n\nMerci,\nL’équipe RESTUP`,
  };
}

/** Collecteur local : dépose un fichier .eml. LEADS_SIMULATE_FAILURE=1 force un échec pour tester la reprise. */
function deliver(id: string, mail: { to: string; subject: string; text: string }) {
  if (env.LEADS_SIMULATE_FAILURE === '1') throw new Error('simulated_failure');
  const eml = `From: ${FROM}\nTo: ${mail.to}\nSubject: ${mail.subject}\nContent-Type: text/plain; charset=utf-8\n\n${mail.text}\n`;
  writeFileSync(join(OUTBOX, `${id}.eml`), eml);
}

export function processQueue() {
  for (const n of due.all(now()) as Array<{
    id: string;
    kind: string;
    attempts: number;
    form_type: string;
    data: string;
  }>) {
    if (claim.run(n.id).changes !== 1) continue;
    try {
      deliver(n.id, compose(n.kind, n.form_type, JSON.parse(n.data)));
      markSent.run(n.id);
    } catch (err) {
      const attempts = n.attempts + 1;
      const final = attempts >= NOTIFY_MAX_ATTEMPTS;
      const next = new Date(Date.now() + Math.min(60_000 * 2 ** attempts, 3_600_000)).toISOString();
      markRetry.run(final ? 'failed' : 'pending', next, (err as Error).message, n.id);
      if (final) console.error(JSON.stringify({ level: 'alert', event: 'notification_failed', notification: n.id }));
    }
  }
}

if (process.argv[1]?.endsWith('leads-server.ts')) {
  // Une notification restée « processing » après un arrêt brutal est remise en file
  // (risque documenté : un e-mail peut alors partir deux fois).
  db.prepare(`UPDATE notifications SET status = 'pending' WHERE status = 'processing'`).run();
  setInterval(processQueue, NOTIFY_EVERY_MS).unref();
  server.listen(PORT, () => {
    console.log(JSON.stringify({ level: 'info', event: 'listening', port: PORT, mode: MODE, origins: ORIGINS }));
  });
}
