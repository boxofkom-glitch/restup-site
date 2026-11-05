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

test('R16 : la prévisualisation montre les 30 prestations avec leur statut interne', () => {
  const html = SLUGS.map((s) => readFileSync(join(PREVIEW, 'expertises', `${s}.html`), 'utf8')).join('');
  for (const id of serviceIds) assert.ok(html.includes(`prestation=${id}`), id);
  assert.ok(html.includes('Tarif indicatif interne'));
});

test('R17 : la production n’expose ni prestation ni tarif non approuvés', () => {
  const files = walk(PROD).filter((f) => /\.(html|js|json|xml)$/.test(f));
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const id of serviceIds) assert.ok(!text.includes(id), `${id} dans ${f}`);
    assert.ok(!/\d\s?€\s?HT/.test(text), `prix dans ${f}`);
    assert.ok(!text.includes('internalPrice'), `catalogue interne dans ${f}`);
  }
});

test('R01 : en production, les fiches en attente sont accessibles, noindex et hors sitemap', () => {
  const sitemap = readdirSync(PROD)
    .filter((f) => f.startsWith('sitemap'))
    .map((f) => readFileSync(join(PROD, f), 'utf8'))
    .join('');
  for (const slug of SLUGS) {
    const html = readFileSync(join(PROD, 'expertises', `${slug}.html`), 'utf8');
    assert.ok(html.includes('Disponibilité à confirmer'), slug);
    assert.ok(/<meta name="robots" content="noindex/.test(html), `noindex ${slug}`);
    assert.ok(html.includes(`/diagnostic?expertise=${slug}`), `Se renseigner ${slug}`);
    assert.ok(!sitemap.includes(`/expertises/${slug}`), `sitemap ${slug}`);
  }
  assert.ok(sitemap.includes('/expertises<') || sitemap.includes('/expertises</loc>'), 'répertoire dans le sitemap');
});

test('la prévisualisation entière est noindex', () => {
  for (const f of walk(PREVIEW).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(f, 'utf8');
    if (html.includes('http-equiv="refresh"')) continue;
    if (html.includes('Générateur de carrousels')) continue;
    assert.ok(/<meta name="robots" content="noindex/.test(html), f);
  }
});
