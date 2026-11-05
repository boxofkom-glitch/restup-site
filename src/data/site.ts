// Contenus éditoriaux partagés et informations à confirmer par RESTUP.

export const SIGNATURE = 'PILOTEZ. OPTIMISEZ. DÉVELOPPEZ.';

/** Ordre officiel des dix divisions dans les menus. */
export const DIVISION_ORDER = [
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

/** Les six domaines de la direction artistique, sous le héros de l'accueil. */
export const DOMAINS = [
  {
    title: 'Rentabilité & KPI',
    text: 'Suivez vos coûts et vos indicateurs pour cibler les priorités.',
    icon: 'tabler:chart-arrows-vertical',
    divisions: ['rest-coaching', 'rest-supply', 'rest-tech'],
  },
  {
    title: 'Organisation & Process',
    text: 'Clarifiez les méthodes et les passages de relais au quotidien.',
    icon: 'tabler:settings-cog',
    divisions: ['rest-coaching', 'rest-tech'],
  },
  {
    title: 'Management & RH',
    text: 'Structurez les rôles, l’intégration et la transmission des méthodes.',
    icon: 'tabler:users-group',
    divisions: ['rest-people', 'rest-academy'],
  },
  {
    title: 'Concept & Menu',
    text: 'Donnez forme à votre concept et à votre offre en salle ou à emporter.',
    icon: 'tabler:burger',
    divisions: ['rest-eat', 'rest-studio', 'rest-space'],
  },
  {
    title: 'Marketing & Acquisition',
    text: 'Préparez vos supports et votre communication pour faire connaître votre offre.',
    icon: 'tabler:speakerphone',
    divisions: ['rest-media', 'rest-studio'],
  },
  {
    title: 'Développement & Franchise',
    text: 'Cadrez les étapes d’une implantation ou d’un développement en réseau.',
    icon: 'tabler:building-store',
    divisions: ['rest-franchise', 'rest-space', 'rest-academy'],
  },
];

/** Les quatre groupes de besoins du répertoire des expertises. */
export const NEEDS = [
  {
    title: 'Mieux piloter mon établissement',
    text: 'Faites le point sur vos coûts, vos ventes et vos outils de suivi pour décider où agir.',
    divisions: ['rest-coaching', 'rest-tech', 'rest-supply'],
  },
  {
    title: 'Développer mes ventes et ma visibilité',
    text: 'Travaillez votre offre en livraison, vos supports de marque et votre communication.',
    divisions: ['rest-eat', 'rest-studio', 'rest-media'],
  },
  {
    title: 'Structurer mon équipe',
    text: 'Clarifiez les rôles, préparez l’intégration des nouvelles recrues et transmettez vos méthodes.',
    divisions: ['rest-people', 'rest-academy'],
  },
  {
    title: 'Préparer une ouverture ou un développement en réseau',
    text: 'Cadrez vos besoins d’implantation et les conditions pour reproduire votre concept.',
    divisions: ['rest-space', 'rest-franchise'],
  },
];

/** Métadonnées SEO des fiches (section 7 et complément final). */
export const DIVISION_META: Record<string, { title: string; description: string }> = {
  'rest-coaching': {
    title: 'Pilotage de la rentabilité restaurant · RESTUP',
    description:
      'Examinez vos ventes, vos coûts et votre organisation pour établir les priorités de pilotage de votre restaurant.',
  },
  'rest-eat': {
    title: 'Livraison et vente à emporter pour restaurants · RESTUP',
    description: 'Examinez votre carte, vos emballages, vos prix et la marge de vos ventes hors salle.',
  },
  'rest-people': {
    title: 'Organisation des équipes de restaurant · RESTUP',
    description:
      'Clarifiez les rôles, l’intégration et les routines de service de votre restaurant avec REST’PEOPLE. Présentez votre besoin.',
  },
  'rest-studio': {
    title: 'Identité visuelle et supports restaurant · RESTUP',
    description:
      'Développez l’identité de votre restaurant et ses supports avec REST’STUDIO. Découvrez les prestations et demandez un devis.',
  },
  'rest-media': {
    title: 'Communication pour restaurants · RESTUP',
    description:
      'Structurez les messages et le calendrier de communication de votre restaurant avec REST’MEDIA. Présentez votre projet.',
  },
  'rest-tech': {
    title: 'Outils et pilotage numérique restaurant · RESTUP',
    description:
      'Faites le point sur vos outils de caisse, commande et reporting avec REST’TECH et définissez les besoins de votre établissement.',
  },
  'rest-academy': {
    title: 'Formation des équipes de restaurant · RESTUP',
    description:
      'Cadrez les ateliers et supports utiles aux équipes de votre restaurant avec REST’ACADEMY. Décrivez vos objectifs.',
  },
  'rest-franchise': {
    title: 'Préparer un réseau de restaurants · RESTUP',
    description:
      'Examinez les méthodes et documents nécessaires au développement de votre concept en réseau avec REST’FRANCHISE.',
  },
  'rest-space': {
    title: 'Implantation et aménagement restaurant · RESTUP',
    description:
      'Définissez les besoins d’usage de votre futur restaurant et préparez le cadrage de son implantation avec REST’SPACE.',
  },
  'rest-supply': {
    title: 'Achats et approvisionnement restaurant · RESTUP',
    description:
      'Examinez vos conditions d’achat, stocks et routines de commande avec REST’SUPPLY. Présentez votre établissement.',
  },
};

/** Question propre à chaque division, affichée après les prestations. */
export const DIVISION_FAQ: Record<string, { q: string; a: string }> = {
  'rest-coaching': {
    q: 'Quels éléments faut-il pour commencer ?',
    a: 'Présentez votre objectif et les données dont vous disposez. Le périmètre de l’analyse et la période à examiner seront précisés lors du cadrage.',
  },
  'rest-eat': {
    q: 'Pouvez-vous étudier plusieurs canaux de vente ?',
    a: 'Indiquez les canaux utilisés et ceux que vous souhaitez développer. Le devis précisera ceux qui seront examinés.',
  },
  'rest-people': {
    q: 'Peut-on travailler sur une équipe déjà en place ?',
    a: 'Le cadrage peut partir de l’organisation actuelle, des passages de relais et des situations de service à améliorer.',
  },
  'rest-studio': {
    q: 'Puis-je conserver mon identité actuelle ?',
    a: 'Oui. Précisez les éléments à conserver et les supports à faire évoluer pour définir le travail graphique.',
  },
  'rest-media': {
    q: 'Les publications sont-elles comprises ?',
    a: 'Le devis précise les contenus produits, leur nombre, les canaux et les éventuelles opérations de publication.',
  },
  'rest-tech': {
    q: 'Faut-il changer tous mes outils ?',
    a: 'L’état des lieux permet d’identifier ce qui répond déjà à vos besoins et les ajustements à examiner.',
  },
  'rest-academy': {
    q: 'Comment définir le programme ?',
    a: 'Indiquez les situations de travail et les personnes concernées. Les objectifs et le format seront précisés lors du cadrage.',
  },
  'rest-franchise': {
    q: 'Peut-on commencer avant d’ouvrir un deuxième établissement ?',
    a: 'Vous pouvez présenter votre concept et son stade de développement pour examiner les éléments à documenter et à tester.',
  },
  'rest-space': {
    q: 'À quel stade présenter mon projet ?',
    a: 'Vous pouvez décrire votre concept avant de retenir un lieu ou présenter un local déjà identifié. Le périmètre dépendra de votre avancement.',
  },
  'rest-supply': {
    q: 'Faut-il déjà disposer de plusieurs fournisseurs ?',
    a: 'Présentez vos achats actuels et vos contraintes. Les éléments à comparer seront définis avec vous.',
  },
};

export const QUOTE_NOTE =
  'Le devis précise les livrables, le calendrier, les modalités de règlement et les éventuels frais complémentaires. Le montant dépend du périmètre retenu et des éléments disponibles.';

/** Formats transversaux de la page Offres (tarifs internes jamais affichés : « Sur devis »). */
export const OFFERS = [
  {
    id: 'diagnostic',
    name: 'Diagnostic ciblé',
    text: 'Pour examiner un sujet précis. L’intervention comprend un échange de cadrage, l’analyse des éléments convenus et une restitution écrite avec les priorités.',
    cta: 'Demander un diagnostic',
    href: '/diagnostic?offre=diagnostic',
  },
  {
    id: 'sprint',
    name: 'Sprint opérationnel',
    text: 'Pour traiter un chantier délimité, comme la carte en livraison ou le suivi des coûts. Nous cadrons le chantier, élaborons les supports convenus et organisons une restitution.',
    cta: 'Parler de mon chantier',
    href: '/diagnostic?offre=sprint',
  },
  {
    id: 'suivi',
    name: 'Suivi de pilotage',
    text: 'Pour suivre les actions engagées. Le périmètre peut inclure un tableau de bord, des points réguliers et l’ajustement du plan d’action.',
    cta: 'Échanger sur un suivi',
    href: '/diagnostic?offre=suivi',
  },
  {
    id: 'sur-mesure',
    name: 'Projet sur mesure',
    text: 'Pour une ouverture, un déploiement multisite ou un besoin qui mobilise plusieurs expertises. Le premier échange sert à délimiter le projet et à identifier les intervenants.',
    cta: 'Présenter mon projet',
    href: '/diagnostic',
  },
];

/**
 * Informations légales et de contact : à fournir par RESTUP.
 * Tant qu'un champ obligatoire est vide, la compilation de production échoue (voir `assertPublishable`).
 */
export const LEGAL = {
  editorName: '', // raison sociale de l'entité éditrice
  legalForm: '', // forme juridique et capital le cas échéant
  address: '',
  registration: '', // RCS / SIREN
  vatNumber: '', // le cas échéant
  publicationDirector: '',
  contactEmail: '', // contact vérifié affiché en secours et pour l'exercice des droits
  host: {
    name: '', // ex. GitHub Inc. si l'hébergement GitHub Pages est confirmé
    address: '',
    contact: '',
  },
  privacy: {
    controller: '',
    rightsContact: '',
    retentionLeads: '', // durée de conservation des demandes
    processors: '', // sous-traitants (hébergement, base de données, e-mail)
  },
  /** Traceurs : aucun traceur optionnel n'est installé. Changer seulement après inventaire. */
  optionalTrackers: false,
  socialLinks: [] as Array<{ name: string; href: string; icon: string }>,
};

export const MISSING_LEGAL = [
  ['Raison sociale de l’éditeur', LEGAL.editorName],
  ['Forme juridique et capital', LEGAL.legalForm],
  ['Adresse de l’éditeur', LEGAL.address],
  ['Immatriculation', LEGAL.registration],
  ['Directeur de la publication', LEGAL.publicationDirector],
  ['Contact vérifié', LEGAL.contactEmail],
  ['Nom de l’hébergeur', LEGAL.host.name],
  ['Adresse de l’hébergeur', LEGAL.host.address],
  ['Contact de l’hébergeur', LEGAL.host.contact],
  ['Responsable du traitement', LEGAL.privacy.controller],
  ['Contact pour l’exercice des droits', LEGAL.privacy.rightsContact],
  ['Durée de conservation des demandes', LEGAL.privacy.retentionLeads],
  ['Sous-traitants', LEGAL.privacy.processors],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);

/** Arrête une compilation de production tant que les informations obligatoires manquent. */
export function assertPublishable(mode: string) {
  // RESTUP_SKIP_LEGAL_CHECK sert uniquement aux tests automatisés du mode production.
  if (mode === 'production' && MISSING_LEGAL.length && process.env.RESTUP_SKIP_LEGAL_CHECK !== '1') {
    throw new Error(
      `Publication bloquée : informations légales manquantes dans src/data/site.ts (${MISSING_LEGAL.join(', ')}).`
    );
  }
}
