// Situations du « Livre du Restaurateur » RESTUP (public/assets/data/livre-data.js), lues au build.
// Chaque division affiche quelques cas concrets : situation, diagnostic, action.
import fs from 'node:fs';
import path from 'node:path';

export interface LivreCase {
  chapter: string;
  title: string;
  situation: string;
  diagnostic: string;
  action: string;
}

interface Chapter {
  id: string;
  name: string;
  situations: Array<{ title: string; situation: string; diagnostic: string; action: string }>;
}

function load(): Chapter[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/assets/data/livre-data.js'), 'utf8');
    return JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
  } catch {
    return [];
  }
}

const chapters = load();

/** [chapitre, index de la situation] retenus pour chaque division. */
const PICKS: Record<string, Array<[string, number]>> = {
  'rest-coaching': [
    ['ch-marge', 0],
    ['ch-pilotage', 1],
    ['ch-marge', 7],
  ],
  'rest-eat': [
    ['ch-livraison', 0],
    ['ch-livraison', 4],
    ['ch-directe', 0],
  ],
  'rest-people': [
    ['ch-equipe', 4],
    ['ch-equipe', 6],
    ['ch-equipe', 2],
  ],
  'rest-studio': [
    ['ch-marketing', 6],
    ['ch-marketing', 7],
    ['ch-directe', 8],
  ],
  'rest-media': [
    ['ch-marketing', 3],
    ['ch-marketing', 4],
    ['ch-relation', 2],
  ],
  'rest-tech': [
    ['ch-pilotage', 0],
    ['ch-directe', 1],
    ['ch-pilotage', 5],
  ],
  'rest-academy': [
    ['ch-production', 5],
    ['ch-equipe', 0],
    ['ch-relation', 4],
  ],
  'rest-franchise': [
    ['ch-pilotage', 9],
    ['ch-production', 6],
    ['ch-pilotage', 3],
  ],
  'rest-space': [
    ['ch-rush', 0],
    ['ch-production', 7],
    ['ch-rush', 7],
  ],
  'rest-supply': [
    ['ch-achats', 0],
    ['ch-achats', 6],
    ['ch-achats', 7],
  ],
};

export function casesFor(slug: string): LivreCase[] {
  return (PICKS[slug] ?? [])
    .map(([id, i]) => {
      const ch = chapters.find((c) => c.id === id);
      const s = ch?.situations[i];
      return ch && s
        ? { chapter: ch.name, title: s.title, situation: s.situation, diagnostic: s.diagnostic, action: s.action }
        : null;
    })
    .filter((c): c is LivreCase => c !== null);
}
