// Contenu détaillé des fiches Expertises : pour qui, ce que ça peut apporter, déroulé, questions.
// Aucun résultat chiffré n'est promis : les effets dépendent du diagnostic et de la mise en œuvre.
// Photos : StockSnap, licence CC0 (usage commercial libre, sans attribution obligatoire).
import type { ImageMetadata } from 'astro';
import coaching from '~/assets/images/expertises/rest-coaching.jpg';
import eat from '~/assets/images/expertises/rest-eat.jpg';
import people from '~/assets/images/expertises/rest-people.jpg';
import studio from '~/assets/images/expertises/rest-studio.jpg';
import media from '~/assets/images/expertises/rest-media.jpg';
import tech from '~/assets/images/expertises/rest-tech.jpg';
import academy from '~/assets/images/expertises/rest-academy.jpg';
import franchise from '~/assets/images/expertises/rest-franchise.jpg';
import space from '~/assets/images/expertises/rest-space.jpg';
import supply from '~/assets/images/expertises/rest-supply.jpg';

export interface DivisionDetail {
  photo: ImageMetadata;
  photoAlt: string;
  /** Phrase d'accroche sous le titre, côté bénéfice. */
  promise: string;
  /** « Vous vous reconnaissez ? » : situations concrètes. */
  signs: string[];
  /** « Ce que ça peut vous apporter ». */
  benefits: Array<{ icon: string; title: string; text: string }>;
  /** « Comment ça se passe ». */
  steps: Array<{ title: string; text: string }>;
  /** Questions supplémentaires (s'ajoutent à DIVISION_FAQ). */
  faq: Array<{ q: string; a: string }>;
}

/** Déroulé commun, adapté par division dans `steps`. */
const start = {
  title: 'Vous présentez votre besoin',
  text: 'Quelques lignes via le formulaire suffisent. Nous revenons vers vous pour un premier échange, sans engagement.',
};

export const DIVISION_DETAILS: Record<string, DivisionDetail> = {
  'rest-coaching': {
    photo: coaching,
    photoAlt: 'Ordinateur affichant des graphiques de chiffres à côté d’une tasse de café',
    promise:
      'Savoir enfin où part votre marge, quoi changer en premier, et tenir le cap semaine après semaine avec un coach à vos côtés.',
    signs: [
      'Le chiffre d’affaires rentre, mais la trésorerie reste tendue en fin de mois.',
      'Vous découvrez vos résultats trop tard, au bilan ou au rendez-vous comptable.',
      'Vous ne connaissez pas précisément votre coût matière ni votre masse salariale.',
      'Vous avez dix chantiers en tête et aucun ordre de priorité clair.',
    ],
    benefits: [
      {
        icon: 'tabler:eye',
        title: 'Une vision claire de vos chiffres',
        text: 'Les indicateurs utiles à votre établissement, et seulement ceux-là : ventes, coût matière, masse salariale, charges.',
      },
      {
        icon: 'tabler:list-numbers',
        title: 'Des priorités, pas une liste sans fin',
        text: 'Une à trois actions à la fois, chacune avec un responsable et une échéance.',
      },
      {
        icon: 'tabler:calendar-repeat',
        title: 'Un rythme qui tient dans la durée',
        text: 'Un point régulier pour décider, débloquer et ajuster le plan à la réalité du terrain.',
      },
      {
        icon: 'tabler:clock-hour-4',
        title: 'Du temps pour diriger',
        text: 'Moins d’urgences subies, plus de décisions prises à froid sur la base de faits.',
      },
    ],
    steps: [
      start,
      {
        title: 'Diagnostic de votre activité',
        text: 'Nous examinons vos ventes, vos coûts et votre organisation à partir des données dont vous disposez : caisse, comptabilité, factures.',
      },
      {
        title: 'Plan d’action priorisé',
        text: 'Vous recevez une synthèse des constats, un tableau de suivi et les actions classées par ordre d’importance.',
      },
      {
        title: 'Suivi et ajustements',
        text: 'Selon la formule retenue, nous suivons l’avancement, mesurons ce qui bouge et ajustons les priorités.',
      },
    ],
    faq: [
      {
        q: 'J’ai déjà un expert-comptable, quelle différence ?',
        a: 'Votre expert-comptable reste essentiel. Il vous dit ce qui s’est passé ; nous transformons ces informations en décisions opérationnelles : carte, achats, organisation, équipe.',
      },
      {
        q: 'Je ne connais pas mes ratios, est-ce un problème ?',
        a: 'Non, c’est fréquent. Nous partons des données disponibles et identifions avec vous les quelques indicateurs à suivre.',
      },
      {
        q: 'Les résultats sont-ils garantis ?',
        a: 'Aucun résultat financier n’est garanti : les effets dépendent du diagnostic et de la mise en œuvre des actions. En revanche, tout ce qui est engagé est suivi et mesuré.',
      },
    ],
  },

  'rest-eat': {
    photo: eat,
    photoAlt: 'Burger généreux en gros plan',
    promise:
      'Vendre en livraison et à emporter sans y laisser votre marge : une carte pensée pour le transport, des prix calculés canal par canal.',
    signs: [
      'Les commandes en livraison augmentent, mais vous ne savez pas si elles sont rentables.',
      'Les commissions des plateformes et le coût des emballages grignotent vos marges.',
      'Certains plats arrivent froids, écrasés ou détrempés, et les avis s’en ressentent.',
      'Aux heures de pointe, les commandes en ligne désorganisent la cuisine et le comptoir.',
    ],
    benefits: [
      {
        icon: 'tabler:calculator',
        title: 'La marge réelle de chaque canal',
        text: 'Une grille qui intègre commissions, emballages et remises pour savoir ce que chaque commande vous rapporte vraiment.',
      },
      {
        icon: 'tabler:burger',
        title: 'Une carte adaptée au transport',
        text: 'Les références qui voyagent bien, mises en avant ; celles qui posent problème, retravaillées ou retirées.',
      },
      {
        icon: 'tabler:tag',
        title: 'Des prix cohérents par canal',
        text: 'Des scénarios de prix pour la salle, la vente à emporter et chaque plateforme.',
      },
      {
        icon: 'tabler:clock-bolt',
        title: 'Un rush mieux maîtrisé',
        text: 'Une procédure de préparation et de remise des commandes qui fluidifie le service.',
      },
    ],
    steps: [
      start,
      {
        title: 'Revue de votre offre hors salle',
        text: 'Carte, prix, frais de plateforme, emballages, avis clients et organisation des commandes.',
      },
      {
        title: 'Grille de calcul et recommandations',
        text: 'Vous recevez la marge par canal, la revue de la carte et une liste d’ajustements à tester.',
      },
      {
        title: 'Mise en place, si vous le souhaitez',
        text: 'Lancement ou réorganisation du canal : paramétrage accompagné, procédure de préparation, contrôle du parcours de commande.',
      },
    ],
    faq: [
      {
        q: 'Travaillez-vous avec toutes les plateformes ?',
        a: 'Nous examinons les canaux que vous utilisez déjà ou envisagez, qu’il s’agisse de plateformes de livraison ou de commande directe.',
      },
      {
        q: 'Faut-il refaire toute la carte ?',
        a: 'Pas nécessairement. La revue permet de distinguer ce qui fonctionne de ce qui doit évoluer, puis de cibler les changements utiles.',
      },
    ],
  },

  'rest-people': {
    photo: people,
    photoAlt: 'Brigade au travail dans une cuisine de restaurant',
    promise:
      'Une équipe qui sait qui fait quoi, des nouvelles recrues opérationnelles plus vite, et un service qui tourne même quand vous n’êtes pas là.',
    signs: [
      'Tout finit par remonter vers vous, même les décisions simples.',
      'Les mêmes erreurs reviennent à chaque service, faute de consignes communes.',
      'Les nouvelles recrues apprennent « sur le tas » et certaines repartent vite.',
      'Les passages de relais entre salle et cuisine, ou entre équipes, créent des oublis.',
    ],
    benefits: [
      {
        icon: 'tabler:sitemap',
        title: 'Des rôles clairs',
        text: 'Chacun connaît ses responsabilités en salle comme en cuisine, ainsi que les décisions qu’il peut prendre seul.',
      },
      {
        icon: 'tabler:user-plus',
        title: 'Une intégration structurée',
        text: 'Un parcours d’accueil pour que les nouvelles recrues trouvent leurs repères plus rapidement.',
      },
      {
        icon: 'tabler:message-2',
        title: 'Des briefings utiles',
        text: 'Des supports courts pour aligner l’équipe avant chaque service.',
      },
      {
        icon: 'tabler:user-check',
        title: 'Moins de dépendance au dirigeant',
        text: 'Une organisation qui tient sans que vous ayez à tout porter vous-même.',
      },
    ],
    steps: [
      start,
      {
        title: 'Observation de l’organisation',
        text: 'Rôles en salle et en cuisine, passages de relais, accueil des nouvelles recrues, situations qui posent problème.',
      },
      {
        title: 'Répartition des rôles et outils',
        text: 'Vous recevez une répartition des responsabilités, un parcours d’intégration et des supports de briefing.',
      },
      {
        title: 'Mise en pratique',
        text: 'Les routines sont testées en service, puis ajustées avec vous et votre équipe.',
      },
    ],
    faq: [
      {
        q: 'Intervenez-vous sur le recrutement ou les contrats ?',
        a: 'Nous travaillons sur l’organisation, les rôles et l’intégration. Les questions de droit du travail relèvent d’un professionnel habilité.',
      },
      {
        q: 'Mon équipe doit-elle être impliquée ?',
        a: 'Oui, c’est recommandé : des routines construites avec l’équipe sont mieux appliquées.',
      },
    ],
  },

  'rest-studio': {
    photo: studio,
    photoAlt: 'Façade d’un restaurant de burgers avec une enseigne lisible',
    promise:
      'Une identité qui se reconnaît au premier regard, de l’enseigne au sac de livraison, et qui donne envie de revenir.',
    signs: [
      'Votre carte, votre enseigne et vos réseaux ne racontent pas la même histoire.',
      'Vos supports ont été faits au fil de l’eau, sans ligne directrice.',
      'En livraison, rien ne distingue votre emballage de celui d’un concurrent.',
      'Vous ouvrez un nouveau concept et partez d’une page blanche.',
    ],
    benefits: [
      {
        icon: 'tabler:palette',
        title: 'Une direction visuelle cohérente',
        text: 'Couleurs, typographies et ton définis une fois pour toutes, et appliqués partout.',
      },
      {
        icon: 'tabler:menu-2',
        title: 'Une carte qui guide le choix',
        text: 'Une mise en page qui facilite la lecture et met en valeur les produits que vous voulez vendre.',
      },
      {
        icon: 'tabler:package',
        title: 'Des emballages qui vous signent',
        text: 'Une déclinaison pour la vente à emporter et la livraison.',
      },
      {
        icon: 'tabler:files',
        title: 'Des fichiers prêts à l’emploi',
        text: 'Des modèles réutilisables pour l’impression et les réseaux sociaux.',
      },
    ],
    steps: [
      start,
      {
        title: 'Cadrage de la marque',
        text: 'Votre concept, votre clientèle, ce qu’il faut conserver et les supports prioritaires selon votre mode de vente.',
      },
      {
        title: 'Création de la direction graphique',
        text: 'Une proposition visuelle, ajustée avec vous jusqu’à validation.',
      },
      {
        title: 'Déclinaison et livraison des fichiers',
        text: 'Menu, emballage, modèles réseaux : les supports convenus, livrés dans les formats utiles.',
      },
    ],
    faq: [
      {
        q: 'L’impression est-elle comprise ?',
        a: 'Nous livrons les fichiers. L’impression et la fabrication sont chiffrées à part ou confiées à vos prestataires.',
      },
    ],
  },

  'rest-media': {
    photo: media,
    photoAlt: 'Mains photographiant des plats avec un smartphone',
    promise:
      'Une communication régulière et maîtrisée : vous savez quoi publier, quand et pour qui, sans y passer vos soirées.',
    signs: [
      'Vous publiez quand vous y pensez, puis plus rien pendant des semaines.',
      'Vous ne savez pas quoi raconter au-delà de la photo du plat du jour.',
      'Une ouverture, une nouveauté ou un événement approche et rien n’est prévu.',
      'Vos réseaux existent, mais ne font pas venir de nouveaux clients.',
    ],
    benefits: [
      {
        icon: 'tabler:target',
        title: 'Des messages clairs',
        text: 'Ce qui vous distingue, formulé simplement et adapté au public que vous voulez toucher.',
      },
      {
        icon: 'tabler:calendar-event',
        title: 'Un calendrier éditorial',
        text: 'Les temps forts de votre année anticipés : lancements, saisons, événements.',
      },
      {
        icon: 'tabler:video',
        title: 'Des formats qui fonctionnent',
        text: 'Publications, vidéos courtes et contenus d’ouverture, avec des exemples prêts à adapter.',
      },
      {
        icon: 'tabler:repeat',
        title: 'De la régularité sans effort',
        text: 'Un plan de diffusion réaliste au regard du temps dont vous disposez.',
      },
    ],
    steps: [
      start,
      {
        title: 'Point sur votre communication',
        text: 'Canaux utilisés, publics visés, temps forts à venir et moyens disponibles.',
      },
      {
        title: 'Plan et calendrier',
        text: 'Vous recevez un calendrier éditorial, des exemples de textes et un plan de diffusion.',
      },
      {
        title: 'Production, selon le devis',
        text: 'Les contenus convenus peuvent être produits et, le cas échéant, publiés.',
      },
    ],
    faq: [
      {
        q: 'Gérez-vous mes comptes au quotidien ?',
        a: 'Le devis précise ce qui est inclus : stratégie seule, production de contenus ou publication.',
      },
    ],
  },

  'rest-tech': {
    photo: tech,
    photoAlt: 'Comptoir de restaurant avec la caisse et l’équipe au service',
    promise:
      'Des outils qui travaillent pour vous : moins de doubles saisies, des données fiables et un tableau de bord que vous consultez vraiment.',
    signs: [
      'Vous ressaisissez les mêmes informations dans plusieurs logiciels.',
      'Votre caisse contient des données que vous n’exploitez jamais.',
      'Vous hésitez entre plusieurs solutions sans savoir laquelle correspond à vos besoins.',
      'Préparer un reporting vous prend des heures chaque mois.',
    ],
    benefits: [
      {
        icon: 'tabler:map-2',
        title: 'Une vue d’ensemble de vos outils',
        text: 'Ce que vous utilisez, ce qui fait doublon et ce qui manque.',
      },
      {
        icon: 'tabler:arrows-exchange',
        title: 'Moins de ressaisies',
        text: 'Les échanges entre caisse, commandes et reporting identifiés et simplifiés.',
      },
      {
        icon: 'tabler:chart-dots',
        title: 'Les bonnes données suivies',
        text: 'Une liste resserrée d’indicateurs utiles au pilotage, alimentée automatiquement autant que possible.',
      },
      {
        icon: 'tabler:checklist',
        title: 'Des choix éclairés',
        text: 'Une liste d’exigences pour comparer les solutions avant d’investir.',
      },
    ],
    steps: [
      start,
      {
        title: 'Inventaire de l’existant',
        text: 'Caisse, prise de commande, comptabilité, plannings : vos outils et la façon dont ils sont utilisés.',
      },
      {
        title: 'Cartographie et exigences',
        text: 'Vous recevez la cartographie de l’existant, une liste d’exigences et un plan de mise en place.',
      },
      {
        title: 'Accompagnement au déploiement',
        text: 'Selon le devis, nous vous aidons à paramétrer et à prendre en main les ajustements retenus.',
      },
    ],
    faq: [
      {
        q: 'Vendez-vous des logiciels ?',
        a: 'Non. Nous vous aidons à définir vos besoins et à choisir, sans lien commercial imposé avec un éditeur.',
      },
    ],
  },

  'rest-academy': {
    photo: academy,
    photoAlt: 'Chef dressant des assiettes avec précision',
    promise:
      'Des équipes formées aux bons gestes, avec des ateliers courts tirés de vos situations de service réelles.',
    signs: [
      'Chacun fait « à sa façon » et la qualité varie d’un service à l’autre.',
      'Vos procédures existent sur papier, mais ne sont pas appliquées.',
      'Former un nouvel équipier mobilise vos meilleurs éléments pendant des jours.',
      'Vous préparez une ouverture et devez former une équipe complète.',
    ],
    benefits: [
      {
        icon: 'tabler:school',
        title: 'Des ateliers concrets',
        text: 'Construits à partir de situations de travail réelles : accueil, briefing, dressage, gestion du rush.',
      },
      {
        icon: 'tabler:copy-check',
        title: 'Des standards partagés',
        text: 'Les mêmes gestes et les mêmes consignes pour toute l’équipe.',
      },
      {
        icon: 'tabler:clipboard-check',
        title: 'Une mise en pratique vérifiable',
        text: 'Une grille simple pour vérifier ce qui est acquis et ce qui reste à travailler.',
      },
      {
        icon: 'tabler:books',
        title: 'Des supports réutilisables',
        text: 'Pour former les prochaines recrues sans tout recommencer.',
      },
    ],
    steps: [
      start,
      {
        title: 'Définition du besoin',
        text: 'Les situations de travail concernées, le public, les objectifs et le format de l’atelier.',
      },
      {
        title: 'Conception des supports',
        text: 'Un déroulé, des supports et une grille de mise en pratique.',
      },
      {
        title: 'Animation et suivi',
        text: 'L’atelier est animé avec votre équipe, puis la mise en pratique est vérifiée.',
      },
    ],
    faq: [
      {
        q: 'Les formations ont-elles lieu dans le restaurant ?',
        a: 'Le lieu et le format sont définis lors du cadrage, en fonction de la situation à travailler et de vos contraintes de service.',
      },
    ],
  },

  'rest-franchise': {
    photo: franchise,
    photoAlt: 'Salle de restaurant rapide décontracté avec comptoir',
    promise:
      'Transformer un établissement qui marche en un concept reproductible : ce qui fait votre succès, documenté et testé avant de vous développer.',
    signs: [
      'Votre premier établissement fonctionne et l’on vous demande déjà « quand le prochain ? ».',
      'Votre savoir-faire est dans votre tête, pas dans des documents.',
      'Vous ne savez pas ce qu’un partenaire ou un futur franchisé devrait recevoir.',
      'Vous hésitez entre succursales, licence de marque et franchise.',
    ],
    benefits: [
      {
        icon: 'tabler:file-check',
        title: 'Un état des lieux honnête',
        text: 'Ce qui est prêt à être dupliqué et ce qui doit encore être stabilisé.',
      },
      {
        icon: 'tabler:book',
        title: 'Un savoir-faire formalisé',
        text: 'La liste des méthodes, recettes et standards à documenter pour les transmettre.',
      },
      {
        icon: 'tabler:route',
        title: 'Une feuille de route',
        text: 'Les étapes de développement dans un ordre réaliste.',
      },
      {
        icon: 'tabler:shield-check',
        title: 'Les bons interlocuteurs',
        text: 'Les questions juridiques identifiées pour être confiées à un professionnel habilité.',
      },
    ],
    steps: [
      start,
      {
        title: 'Examen du concept',
        text: 'Méthodes d’exploitation, transmission du savoir-faire, résultats et conditions de déploiement.',
      },
      {
        title: 'État des lieux et feuille de route',
        text: 'Les éléments à formaliser et les étapes de développement, classés par priorité.',
      },
      {
        title: 'Accompagnement de la formalisation',
        text: 'Selon le devis, nous vous aidons à documenter et tester avant de reproduire.',
      },
    ],
    faq: [
      {
        q: 'Rédigez-vous le contrat de franchise ou le DIP ?',
        a: 'Non. Les documents juridiques sont confiés à un professionnel habilité ; nous préparons le volet opérationnel du concept.',
      },
    ],
  },

  'rest-space': {
    photo: space,
    photoAlt: 'Café lumineux avec comptoir, tableau de menu et grandes baies vitrées',
    promise:
      'Un lieu pensé pour votre façon de travailler : des flux qui fonctionnent pour l’équipe et une expérience agréable pour vos clients.',
    signs: [
      'Vous cherchez un local et ne savez pas comment comparer les options.',
      'En cuisine ou au comptoir, l’équipe se croise et perd du temps.',
      'Les clients attendent sans savoir où se placer, ou les livreurs encombrent l’entrée.',
      'Vous préparez des travaux et voulez arriver devant les intervenants avec un besoin clair.',
    ],
    benefits: [
      {
        icon: 'tabler:clipboard-list',
        title: 'Un cahier des besoins',
        text: 'Votre concept et votre mode de service traduits en besoins d’usage concrets.',
      },
      {
        icon: 'tabler:scale',
        title: 'Une grille de comparaison',
        text: 'Pour évaluer plusieurs locaux ou plusieurs scénarios sur les mêmes critères.',
      },
      {
        icon: 'tabler:route-2',
        title: 'Des flux réfléchis',
        text: 'Circulation de l’équipe, des clients et des livreurs, anticipée avant les travaux.',
      },
      {
        icon: 'tabler:messages',
        title: 'Des échanges plus efficaces',
        text: 'Les bonnes questions à poser aux architectes, bureaux d’études et bailleurs.',
      },
    ],
    steps: [
      start,
      {
        title: 'Cadrage du projet',
        text: 'Concept, volume attendu, mode de service, contraintes et stade d’avancement.',
      },
      {
        title: 'Cahier des besoins',
        text: 'Vous recevez le cahier des besoins, une grille de comparaison et les questions pour les intervenants.',
      },
      {
        title: 'Relais aux professionnels',
        text: 'Les études techniques, réglementaires et immobilières sont menées par les professionnels habilités.',
      },
    ],
    faq: [
      {
        q: 'Faites-vous les plans du restaurant ?',
        a: 'Non. Nous définissons les besoins d’usage ; les plans et études techniques relèvent des architectes et bureaux d’études.',
      },
    ],
  },

  'rest-supply': {
    photo: supply,
    photoAlt: 'Étal de fruits et légumes frais',
    promise: 'Des achats maîtrisés : de meilleures conditions, moins de pertes et des commandes passées au bon moment.',
    signs: [
      'Vos prix d’achat augmentent et vous ne savez pas si vous pouvez obtenir mieux.',
      'Vous êtes régulièrement en rupture sur certains produits, en surstock sur d’autres.',
      'Les commandes se font « au feeling », sans seuils ni règles.',
      'Une partie de la marchandise finit à la poubelle chaque semaine.',
    ],
    benefits: [
      {
        icon: 'tabler:scale',
        title: 'Des conditions comparées',
        text: 'Une grille qui compare vos fournisseurs famille de produits par famille de produits.',
      },
      {
        icon: 'tabler:stack-2',
        title: 'Des stocks sous contrôle',
        text: 'Des seuils de commande et de stock définis selon votre activité réelle.',
      },
      {
        icon: 'tabler:trash-off',
        title: 'Moins de pertes',
        text: 'Les causes des pertes identifiées et des routines simples pour les limiter.',
      },
      {
        icon: 'tabler:calendar-time',
        title: 'Des commandes anticipées',
        text: 'Une fréquence de commande adaptée qui limite les ruptures et les achats d’urgence.',
      },
    ],
    steps: [
      start,
      {
        title: 'Analyse de vos achats',
        text: 'Familles de produits, fournisseurs, fréquence de commande, stocks et pertes.',
      },
      {
        title: 'Grille et seuils',
        text: 'Vous recevez une grille de comparaison, des seuils de suivi et des actions pour mieux anticiper.',
      },
      {
        title: 'Mise en œuvre',
        text: 'Les nouvelles règles sont appliquées et suivies, et ajustées si nécessaire.',
      },
    ],
    faq: [
      {
        q: 'Négociez-vous à ma place avec mes fournisseurs ?',
        a: 'Nous préparons la comparaison et les arguments ; la relation et la décision restent les vôtres.',
      },
    ],
  },
};
