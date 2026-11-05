// Tests du serveur de demandes : validation, liste blanche, idempotence, origine, file de notifications.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

const dir = mkdtempSync(join(tmpdir(), 'restup-leads-'));
process.env.LEADS_DB = join(dir, 'leads.sqlite');
process.env.LEADS_OUTBOX = join(dir, 'outbox');
process.env.LEADS_ALLOWED_ORIGINS = 'http://localhost:4321';
process.env.LEADS_RATE_MAX = '1000';
process.env.RESTUP_MODE = 'preview';

const mod = await import('../scripts/leads-server.ts');
let base = '';
before(async () => {
  await new Promise<void>((r) => mod.server.listen(0, r));
  base = `http://127.0.0.1:${(mod.server.address() as AddressInfo).port}`;
});
after(() => {
  mod.server.close();
  rmSync(dir, { recursive: true, force: true });
});

const valid = {
  formType: 'diagnostic',
  name: 'Essai Recette',
  email: 'essai@example.test',
  stage: 'En activité',
  need: 'rest-coaching',
  service: 'rest-coaching-2',
  message: 'Message de test assez long pour être accepté.',
};
const post = (body: object, key = crypto.randomUUID(), origin = 'http://localhost:4321') =>
  fetch(`${base}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, Origin: origin },
    body: JSON.stringify(body),
  });

test('une demande valide est enregistrée (201)', async () => {
  const res = await post(valid);
  assert.equal(res.status, 201);
  assert.ok((await res.json()).id);
});

test('même clé et même contenu : même demande (200), pas de doublon', async () => {
  const key = crypto.randomUUID();
  const a = await (await post(valid, key)).json();
  const res = await post(valid, key);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).id, a.id);
});

test('même clé et contenu différent : conflit (409)', async () => {
  const key = crypto.randomUUID();
  await post(valid, key);
  assert.equal((await post({ ...valid, message: 'Un autre message suffisamment long.' }, key)).status, 409);
});

test('valeurs hors liste ou incompatibles rejetées (422)', async () => {
  for (const body of [
    { ...valid, stage: 'Inventé' },
    { ...valid, need: 'rest-inconnue' },
    { ...valid, service: 'rest-eat-1' }, // prestation d'une autre division
    { ...valid, message: 'trop court' },
    { ...valid, email: 'pas-un-email' },
    { ...valid, formType: 'contact', subject: 'Spam' },
  ]) {
    const res = await post(body);
    assert.equal(res.status, 422, JSON.stringify(body));
  }
});

test('origine non autorisée refusée (403)', async () => {
  assert.equal((await post(valid, undefined, 'https://evil.example')).status, 403);
});

test('champ piège rempli : rien n’est enregistré', async () => {
  assert.equal((await post({ ...valid, website: 'http://spam' })).status, 422);
});

test('la file envoie chaque notification une seule fois, même en traitement concurrent', async () => {
  await post(valid);
  mod.processQueue();
  mod.processQueue();
  const files = readdirSync(process.env.LEADS_OUTBOX!);
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(process.env.LEADS_DB!);
  const rows = db.prepare(`SELECT status, count(*) c FROM notifications GROUP BY status`).all() as Array<{
    status: string;
    c: number;
  }>;
  const sent = rows.find((r) => r.status === 'sent')?.c ?? 0;
  assert.equal(files.length, sent);
  assert.equal(rows.find((r) => r.status === 'pending')?.c ?? 0, 0);
});

test('un échec d’envoi laisse la notification en file avec reprise', async () => {
  await post(valid);
  process.env.LEADS_SIMULATE_FAILURE = '1';
  mod.processQueue();
  delete process.env.LEADS_SIMULATE_FAILURE;
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(process.env.LEADS_DB!);
  const failed = db.prepare(`SELECT count(*) c FROM notifications WHERE status = 'pending' AND attempts = 1`).get() as {
    c: number;
  };
  assert.equal(failed.c, 2);
  const leads = db.prepare(`SELECT count(*) c FROM leads`).get() as { c: number };
  assert.ok(leads.c > 0, 'la demande reste enregistrée');
});
