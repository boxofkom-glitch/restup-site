// Tests des pages compilées : navigation, catalogue en prévisualisation, absence de données internes en production.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SLUGS = [
  'rest-coaching',
  'rest-eat',
  'rest-people',
  'rest-studio',
  'rest-media',
  'rest-tech',
  'rest-academy',
  'rest-franchise',
  'rest-space',
  'rest-supply',
];
const catalogue = JSON.parse(readFileSync('src/data/catalogue.json', 'utf8'));
const serviceIds: string[] = catalogue.divisions.flatMap((d: { services: Array<{ id: string }> }) =>
  d.services.map((s) => s.id)
);

function build(mode: 'preview' | 'production', outDir: string) {
  rmSync(outDir, { recursive: true, force: true });
  execFileSync('npx', ['astro', 'build', '--outDir', outDir], {
    env: { ...process.env, RESTUP_MODE: mode, RESTUP_SKIP_LEGAL_CHECK: '1' },
    stdio: 'ignore',
  });
}
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === 'portail' ? [] : walk(join(dir, e.name))) : [join(dir, e.name)]
  );

const PREVIEW = '.test-dist/preview';
const PROD = '.test-dist/production';
build('preview', PREVIEW);
build('production', PROD);

test('R01/R15 : les dix divisions ont leur page et leur lien dans le menu', () => {
  const home = readFileSync(join(PREVIEW, 'index.html'), 'utf8');
  for (const slug of SLUGS) {
    assert.ok(existsSync(join(PREVIEW, 'expertises', `${slug}.html`)), slug);
    assert.ok(home.includes(`href="/expertises/${slug}"`), `lien ${slug}`);
  }
});

test('R16 : la prévisualisation montre les 30 prestations', () => {
  const html = SLUGS.map((s) => readFileSync(join(PREVIEW, 'expertises', `${s}.html`), 'utf8')).join('');
  for (const id of serviceIds) assert.ok(html.includes(`prestation=${id}`), id);
});

type Svc = { id: string; serviceStatus: string; priceStatus: string; internalPrice: { mode: string; min?: number } };
const divisionsRaw: Array<{ slug: string; contentStatus: string; services: Svc[] }> = catalogue.divisions;
const euros = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/\u202f/g, '\u00a0');

test('R17/R18 : la production n’émet que les prestations et tarifs approuvés', () => {
  const files = walk(PROD).filter((f) => /\.(html|js|json|xml)$/.test(f));
  const all = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.ok(!all.includes('internalPrice'), 'catalogue interne exposé');
  for (const d of divisionsRaw) {
    const page = readFileSync(join(PROD, 'expertises', `${d.slug}.html`), 'utf8');
    for (const s of d.services) {
      const visible = s.serviceStatus === 'approved';
      assert.equal(page.includes(`prestation=${s.id}`), visible, `${s.id} visible=${visible}`);
      if (s.internalPrice.mode === 'range' && s.internalPrice.min) {
        const priced = visible && s.priceStatus === 'approved';
        assert.equal(page.includes(`${euros(s.internalPrice.min)} –`), priced, `${s.id} prix=${priced}`);
      }
    }
    assert.ok(!page.includes('Tarif indicatif interne'), d.slug);
  }
});

test('R01 : en production, indexation et sitemap suivent la validation des fiches', () => {
  const sitemap = readdirSync(PROD)
    .filter((f) => f.startsWith('sitemap'))
    .map((f) => readFileSync(join(PROD, f), 'utf8'))
    .join('');
  for (const d of divisionsRaw) {
    const html = readFileSync(join(PROD, 'expertises', `${d.slug}.html`), 'utf8');
    const approved = d.contentStatus === 'approved';
    assert.equal(/<meta name="robots" content="noindex/.test(html), !approved, `noindex ${d.slug}`);
    assert.equal(sitemap.includes(`/expertises/${d.slug}<`), approved, `sitemap ${d.slug}`);
    if (!d.services.some((s) => s.serviceStatus === 'approved')) assert.ok(html.includes('Disponibilité à confirmer'));
  }
  assert.ok(sitemap.includes('/expertises<'), 'répertoire dans le sitemap');
});

test('la prévisualisation entière est noindex', () => {
  for (const f of walk(PREVIEW).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(f, 'utf8');
    if (html.includes('http-equiv="refresh"')) continue;
    if (html.includes('Générateur de carrousels')) continue;
    if (f.includes(`${join(PREVIEW, 'experience')}`)) continue; // page autonome (prototype WebGL)
    assert.ok(/<meta name="robots" content="noindex/.test(html), f);
  }
});
