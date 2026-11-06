// Catalogue RESTUP : dix divisions, trente prestations.
// Ce module ne doit être importé que dans le frontmatter des pages (rendu au build) :
// les tarifs internes ne quittent jamais le serveur de build. Les pages n'émettent
// que la projection autorisée par le mode de publication.
import raw from '~/data/catalogue.json';

export type Status = 'pending' | 'approved';

interface InternalPrice {
  mode: 'range' | 'fixed' | 'quote';
  min?: number;
  max?: number;
  amount?: number;
  currency?: string;
  tax?: string;
  unitLabel?: string;
}

interface RawService {
  id: string;
  name: string;
  scope: string;
  serviceStatus: Status;
  priceStatus: Status;
  internalPrice: InternalPrice;
  quotePath: string;
}

interface RawDivision {
  slug: string;
  name: string;
  path: string;
  contentStatus: Status;
  h1: string;
  summary: string;
  scope: string;
  deliverable: string;
  cta: string;
  relatedSlugs: string[];
  services: RawService[];
}

const catalogue = raw as { divisions: RawDivision[] };

/**
 * `preview` : prévisualisation protégée, tout le catalogue est visible avec ses statuts internes.
 * `production` : seules les prestations approuvées sont émises, et leurs prix seulement s'ils sont approuvés.
 */
export const MODE: 'preview' | 'production' = process.env.RESTUP_MODE === 'production' ? 'production' : 'preview';
export const isPreview = MODE === 'preview';

/** Ce qu'une carte de prestation a le droit d'afficher, selon le mode et les statuts. */
export interface PublicService {
  id: string;
  name: string;
  scope: string;
  /** Libellé de prix prêt à afficher (« 390 – 690 € HT » ou « Sur devis »). */
  price: string;
  unit?: string;
  /** Montant plancher HT (bas de fourchette), seulement quand le prix est affiché. */
  minAmount?: number;
  /** Mention de statut affichée en prévisualisation uniquement. */
  internalNote?: string;
  quotePath: string;
}

export interface PublicDivision {
  slug: string;
  name: string;
  path: string;
  h1: string;
  summary: string;
  scope: string;
  deliverable: string;
  cta: string;
  relatedSlugs: string[];
  /** La fiche est indexable seulement si son contenu commercial est validé (et jamais en prévisualisation). */
  indexable: boolean;
  /** « Disponibilité à confirmer » quand aucune prestation n'est visible. */
  available: boolean;
  services: PublicService[];
}

const euro = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/\u202f/g, '\u00a0');

function formatPrice(p: InternalPrice) {
  if (p.mode === 'quote') return 'Sur devis';
  if (p.mode === 'range') return `${euro(p.min!)} – ${euro(p.max!)} € ${p.tax ?? 'HT'}`;
  return `${euro(p.amount!)} € ${p.tax ?? 'HT'}`;
}

function floor(p: InternalPrice) {
  return p.mode === 'range' ? p.min : p.mode === 'fixed' ? p.amount : undefined;
}

/** Montant formaté, ex. « 1 890 € ». */
export const formatEuro = (n: number) => `${euro(n)} €`;

function project(s: RawService): PublicService | null {
  if (isPreview) {
    const pending = s.serviceStatus !== 'approved' || s.priceStatus !== 'approved';
    return {
      id: s.id,
      name: s.name,
      scope: s.scope,
      price: formatPrice(s.internalPrice),
      unit: s.internalPrice.mode === 'quote' ? undefined : s.internalPrice.unitLabel,
      minAmount: floor(s.internalPrice),
      internalNote: pending ? 'Tarif indicatif interne' : undefined,
      quotePath: s.quotePath,
    };
  }
  if (s.serviceStatus !== 'approved') return null;
  const priced = s.priceStatus === 'approved' && s.internalPrice.mode !== 'quote';
  return {
    id: s.id,
    name: s.name,
    scope: s.scope,
    price: priced ? formatPrice(s.internalPrice) : 'Sur devis',
    unit: priced ? s.internalPrice.unitLabel : undefined,
    minAmount: priced ? floor(s.internalPrice) : undefined,
    quotePath: s.quotePath,
  };
}

export const divisions: PublicDivision[] = catalogue.divisions.map((d) => {
  const services = d.services.map(project).filter((s): s is PublicService => s !== null);
  return {
    slug: d.slug,
    name: d.name,
    path: d.path,
    h1: d.h1,
    summary: d.summary,
    scope: d.scope,
    deliverable: d.deliverable,
    cta: d.cta,
    relatedSlugs: d.relatedSlugs,
    indexable: !isPreview && d.contentStatus === 'approved',
    available: services.length > 0,
    services,
  };
});

export const divisionBySlug = (slug: string) => divisions.find((d) => d.slug === slug);

/** Liste blanche utilisée par le formulaire : divisions et prestations visibles dans ce mode. */
export const formChoices = divisions.map((d) => ({
  slug: d.slug,
  name: d.name,
  services: d.services.map((s) => ({ id: s.id, name: s.name })),
}));

/** Fiches exclues du sitemap (noindex). */
export const noindexPaths = divisions.filter((d) => !d.indexable).map((d) => d.path);

/**
 * Prix « à partir de » d'une formule : somme des k premières prestations (entrée, plat, dessert)
 * de la division la moins chère, calculée sur les seuls prix affichés.
 */
export function formulaFrom(k: number): number | undefined {
  const sums = divisions
    .map((d) => d.services.slice(0, k))
    .filter((list) => list.length === k && list.every((s) => typeof s.minAmount === 'number'))
    .map((list) => list.reduce((t, s) => t + (s.minAmount ?? 0), 0));
  return sums.length ? Math.min(...sums) : undefined;
}
