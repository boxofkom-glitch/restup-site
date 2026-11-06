// Fiches détaillées des 30 prestations, affichées sur « La Carte » et les pages Expertises.
// ⚠️ Délais PROPOSÉS, à valider par RESTUP : ils démarrent à réception des éléments demandés.

export interface ServiceDetail {
  /** Délai indicatif de réalisation. */
  delay: string;
  /** Format de l'intervention (à distance, sur place…). */
  format: string;
  /** Ce qui est inclus. */
  includes: string[];
  /** Ce que le client reçoit à la fin. */
  deliverable: string;
  /** « Idéal si… » */
  idealFor: string;
}

/** Les trois temps de chaque division, servis comme un menu. */
export const COURSES = [
  { key: 'entree', label: 'L’Entrée', hint: 'Pour cerner le sujet' },
  { key: 'plat', label: 'Le Plat', hint: 'Le chantier principal' },
  { key: 'dessert', label: 'Le Dessert', hint: 'Pour ancrer dans la durée' },
] as const;

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  // REST’COACHING
  'rest-coaching-1': {
    delay: '1 à 2 semaines',
    format: 'Échange de cadrage, analyse à distance, restitution en visio ou sur place',
    includes: [
      'Échange de cadrage sur vos objectifs',
      'Analyse des ventes, du coût matière et de la masse salariale',
      'Repérage des écarts et des postes qui pèsent le plus',
      'Restitution commentée',
    ],
    deliverable: 'Une synthèse écrite des constats et 3 priorités classées par impact.',
    idealFor: 'Vous sentez que la marge vous échappe sans savoir par où commencer.',
  },
  'rest-coaching-2': {
    delay: '4 à 6 semaines',
    format: 'Mission courte avec points hebdomadaires',
    includes: [
      'Tout le contenu de l’audit de pilotage',
      'Plan d’action détaillé avec responsables et échéances',
      'Tableau de suivi des indicateurs clés',
      'Un point par semaine pour lever les blocages',
    ],
    deliverable: 'Un plan d’action priorisé, un tableau de suivi prêt à l’emploi et un bilan de fin de sprint.',
    idealFor: 'Vous voulez des décisions concrètes et un premier chantier mené jusqu’au bout.',
  },
  'rest-coaching-3': {
    delay: 'Mensuel, sans engagement de durée',
    format: 'Un point de pilotage par semaine et un bilan mensuel',
    includes: [
      'Mise à jour des indicateurs chaque mois',
      'Point hebdomadaire pour décider et débloquer',
      'Ajustement du plan d’action',
      'Récapitulatif écrit après chaque échange',
    ],
    deliverable: 'Un tableau de bord tenu à jour et un plan d’action qui évolue avec vos résultats.',
    idealFor: 'Vous voulez un regard extérieur régulier pour tenir le cap.',
  },

  // REST’EAT
  'rest-eat-1': {
    delay: '1 à 2 semaines',
    format: 'Analyse à distance de vos relevés de plateforme, restitution en visio',
    includes: [
      'Revue d’un canal de vente : carte, prix, frais, emballages',
      'Calcul de la marge réelle par commande',
      'Lecture des avis et des réclamations',
      'Restitution commentée',
    ],
    deliverable: 'Une grille de marge par canal et une liste d’ajustements à tester.',
    idealFor: 'Vos ventes en livraison montent mais vous doutez de leur rentabilité.',
  },
  'rest-eat-2': {
    delay: '3 à 5 semaines',
    format: 'Ateliers de travail et tests en cuisine',
    includes: [
      'Sélection des références qui voyagent bien',
      'Scénarios de prix par canal',
      'Recommandations d’emballage',
      'Structure et intitulés de la carte en ligne',
    ],
    deliverable: 'Une carte à emporter prête à mettre en ligne, avec ses prix et ses emballages.',
    idealFor: 'Votre carte en livraison est la copie de celle de la salle.',
  },
  'rest-eat-3': {
    delay: '4 à 8 semaines',
    format: 'Accompagnement projet, sur place et à distance',
    includes: [
      'Paramétrage accompagné du canal, selon l’accès accordé',
      'Procédure de préparation et de remise des commandes',
      'Contrôle du parcours de commande',
      'Suivi des premières semaines',
    ],
    deliverable: 'Un canal opérationnel, une procédure écrite et un bilan des premières semaines.',
    idealFor: 'Vous lancez la livraison, ou elle désorganise votre service aux heures de pointe.',
  },

  // REST’PEOPLE
  'rest-people-1': {
    delay: '1 à 2 semaines',
    format: 'Observation d’un service et entretiens',
    includes: [
      'Observation d’un service en salle et en cuisine',
      'Entretiens avec vous et vos responsables',
      'Repérage des passages de relais fragiles',
      'Restitution commentée',
    ],
    deliverable: 'Une cartographie des rôles actuels et des points de friction prioritaires.',
    idealFor: 'Tout remonte vers vous, même les décisions simples.',
  },
  'rest-people-2': {
    delay: '2 à 4 semaines',
    format: 'Ateliers avec vous et vos responsables',
    includes: [
      'Parcours d’accueil du premier jour au premier mois',
      'Fiches de poste simplifiées',
      'Checklist d’intégration',
      'Supports remis à la nouvelle recrue',
    ],
    deliverable: 'Un kit d’intégration complet, prêt à l’emploi pour vos prochaines recrues.',
    idealFor: 'Vos nouvelles recrues apprennent sur le tas et repartent vite.',
  },
  'rest-people-3': {
    delay: '4 à 8 semaines',
    format: 'Mission sur place avec tests en service',
    includes: [
      'Répartition des rôles en salle et en cuisine',
      'Routines de service et passages de relais',
      'Supports de briefing avant service',
      'Test en service puis ajustements',
    ],
    deliverable: 'Une organisation du service écrite, testée et ajustée avec votre équipe.',
    idealFor: 'Les mêmes erreurs reviennent à chaque coup de feu.',
  },

  // REST’STUDIO
  'rest-studio-1': {
    delay: '2 à 3 semaines',
    format: 'Atelier de cadrage et propositions visuelles',
    includes: [
      'Atelier sur votre concept et votre clientèle',
      'Planche d’inspiration',
      'Pistes de couleurs, typographies et ton',
      'Une série d’ajustements',
    ],
    deliverable: 'Une direction visuelle validée qui servira de base à tous vos supports.',
    idealFor: 'Vos supports ont été faits au fil de l’eau, sans ligne commune.',
  },
  'rest-studio-2': {
    delay: '4 à 6 semaines',
    format: 'Création en plusieurs allers-retours',
    includes: [
      'Logo ou évolution du logo existant',
      'Palette, typographies et règles d’usage',
      'Mini-charte au format PDF',
      'Fichiers sources livrés',
    ],
    deliverable: 'Une identité complète et une mini-charte pour l’appliquer partout.',
    idealFor: 'Vous ouvrez un concept, ou votre marque n’est plus à la hauteur de votre cuisine.',
  },
  'rest-studio-3': {
    delay: '2 à 4 semaines par lot',
    format: 'Création à partir de votre charte',
    includes: [
      'Menu sur place ou à emporter',
      'Déclinaison d’emballage',
      'Modèles pour les réseaux sociaux',
      'Fichiers prêts à imprimer',
    ],
    deliverable: 'Les supports convenus, livrés dans les formats d’impression et numériques.',
    idealFor: 'Votre carte et vos emballages ne racontent pas la même histoire que votre enseigne.',
  },

  // REST’MEDIA
  'rest-media-1': {
    delay: '1 semaine',
    format: 'Analyse à distance et restitution en visio',
    includes: [
      'Revue de votre fiche Google et de vos avis',
      'Revue de vos réseaux sociaux',
      'Comparaison avec 2 concurrents proches',
      'Recommandations prioritaires',
    ],
    deliverable: 'Un état des lieux de votre visibilité et 5 actions prioritaires.',
    idealFor: 'Vos réseaux existent mais ne font pas venir de nouveaux clients.',
  },
  'rest-media-2': {
    delay: '2 à 3 semaines',
    format: 'Atelier puis rédaction',
    includes: [
      'Messages clés de votre lancement',
      'Calendrier des publications',
      'Exemples de textes et de visuels à produire',
      'Plan de diffusion',
    ],
    deliverable: 'Un plan éditorial de lancement prêt à exécuter.',
    idealFor: 'Une ouverture, une nouveauté ou un événement approche et rien n’est prévu.',
  },
  'rest-media-3': {
    delay: 'Mensuel',
    format: 'Accompagnement continu',
    includes: [
      'Calendrier éditorial du mois',
      'Rédaction des textes convenus',
      'Conseils de prise de vue',
      'Bilan mensuel',
    ],
    deliverable: 'Une communication régulière, préparée chaque mois avec vous.',
    idealFor: 'Vous publiez quand vous y pensez, puis plus rien pendant des semaines.',
  },

  // REST’TECH
  'rest-tech-1': {
    delay: '1 à 2 semaines',
    format: 'Entretiens et revue de vos outils',
    includes: [
      'Inventaire des outils : caisse, commande, comptabilité, planning',
      'Repérage des doubles saisies',
      'Données utiles au pilotage',
      'Restitution commentée',
    ],
    deliverable: 'Une cartographie de l’existant et la liste des irritants prioritaires.',
    idealFor: 'Vous ressaisissez les mêmes chiffres dans plusieurs logiciels.',
  },
  'rest-tech-2': {
    delay: '3 à 4 semaines',
    format: 'Cadrage, démonstrations et comparatif',
    includes: [
      'Liste d’exigences adaptée à votre établissement',
      'Présélection de solutions',
      'Grille de comparaison',
      'Recommandation argumentée',
    ],
    deliverable: 'Un cahier des exigences et une recommandation de solution.',
    idealFor: 'Vous hésitez entre plusieurs logiciels avant d’investir.',
  },
  'rest-tech-3': {
    delay: '4 à 8 semaines',
    format: 'Accompagnement projet',
    includes: [
      'Plan de mise en place',
      'Paramétrage accompagné',
      'Prise en main par l’équipe',
      'Contrôle des premières données',
    ],
    deliverable: 'Des outils paramétrés, une équipe formée et un premier reporting fiable.',
    idealFor: 'Vous avez choisi vos outils et voulez qu’ils soient vraiment utilisés.',
  },

  // REST’ACADEMY
  'rest-academy-1': {
    delay: 'Préparation : 1 à 2 semaines',
    format: 'Une demi-journée, dans votre établissement ou à distance',
    includes: [
      'Cadrage de l’objectif avec vous',
      'Atelier pratique à partir de vos situations de service',
      'Support remis aux participants',
      'Grille de mise en pratique',
    ],
    deliverable: 'Un atelier animé et une grille pour vérifier ce qui est acquis.',
    idealFor: 'Un point précis à corriger : accueil, briefing, annonce des commandes…',
  },
  'rest-academy-2': {
    delay: 'Préparation : 2 semaines',
    format: 'Une journée avec votre équipe',
    includes: [
      'Programme construit avec vous',
      'Alternance d’apports et de mises en situation',
      'Supports remis aux participants',
      'Bilan avec le dirigeant',
    ],
    deliverable: 'Une journée d’équipe et un plan de mise en pratique.',
    idealFor: 'Chacun fait « à sa façon » et la qualité varie d’un service à l’autre.',
  },
  'rest-academy-3': {
    delay: '1 à 3 mois',
    format: 'Plusieurs sessions et un suivi',
    includes: [
      'Programme sur mesure en plusieurs modules',
      'Supports réutilisables pour les futures recrues',
      'Évaluation de la mise en pratique',
      'Bilan de fin de parcours',
    ],
    deliverable: 'Un parcours de formation complet que vous pourrez reconduire.',
    idealFor: 'Vous préparez une ouverture ou formez une équipe entière.',
  },

  // REST’FRANCHISE
  'rest-franchise-1': {
    delay: '2 à 3 semaines',
    format: 'Entretiens, observation et revue documentaire',
    includes: [
      'Examen de vos méthodes d’exploitation',
      'Revue de vos résultats et de leur stabilité',
      'Inventaire du savoir-faire à transmettre',
      'Restitution commentée',
    ],
    deliverable: 'Un état des lieux de la préparation de votre concept à la duplication.',
    idealFor: 'Votre premier établissement fonctionne et l’on vous demande « à quand le prochain ? ».',
  },
  'rest-franchise-2': {
    delay: '2 à 4 mois',
    format: 'Mission avec ateliers réguliers',
    includes: [
      'Standards d’exploitation écrits',
      'Fiches techniques et procédures',
      'Parcours de formation d’un futur exploitant',
      'Tests dans votre établissement',
    ],
    deliverable: 'Le volet opérationnel de votre concept, documenté et testé.',
    idealFor: 'Votre savoir-faire est dans votre tête, pas dans des documents.',
  },
  'rest-franchise-3': {
    delay: 'Selon le projet',
    format: 'Sur devis, après le diagnostic de préparation',
    includes: [
      'Étapes de développement dans un ordre réaliste',
      'Ressources et compétences nécessaires',
      'Jalons et indicateurs de suivi',
      'Questions à confier aux professionnels habilités',
    ],
    deliverable: 'Une feuille de route de développement en réseau.',
    idealFor: 'Vous hésitez entre succursales, licence et franchise.',
  },

  // REST’SPACE
  'rest-space-1': {
    delay: '1 à 2 semaines',
    format: 'Atelier de cadrage',
    includes: [
      'Traduction du concept en besoins d’usage',
      'Volume attendu et mode de service',
      'Contraintes et points de vigilance',
      'Restitution écrite',
    ],
    deliverable: 'Une fiche de cadrage du lieu idéal pour votre concept.',
    idealFor: 'Vous cherchez un local et ne savez pas comment comparer.',
  },
  'rest-space-2': {
    delay: '1 semaine par local',
    format: 'Visite sur place et analyse',
    includes: [
      'Visite du local',
      'Analyse des flux : équipe, clients, livreurs',
      'Points forts, limites et questions à poser',
      'Avis écrit',
    ],
    deliverable: 'Un avis argumenté sur l’adéquation du local à votre concept.',
    idealFor: 'Vous avez un local en vue et voulez un regard d’exploitant avant de signer.',
  },
  'rest-space-3': {
    delay: '3 à 5 semaines',
    format: 'Ateliers et rédaction',
    includes: [
      'Besoins par zone : cuisine, comptoir, salle, stockage',
      'Circulation de l’équipe et des clients',
      'Grille de comparaison des scénarios',
      'Questions pour l’architecte et les bureaux d’études',
    ],
    deliverable: 'Un cahier des besoins d’aménagement à remettre aux intervenants techniques.',
    idealFor: 'Vous préparez des travaux et voulez arriver avec un besoin clair.',
  },

  // REST’SUPPLY
  'rest-supply-1': {
    delay: '1 à 2 semaines',
    format: 'Analyse de vos factures et de vos commandes',
    includes: [
      'Revue des familles de produits et des fournisseurs',
      'Analyse des prix et de leur évolution',
      'Repérage des ruptures, surstocks et pertes',
      'Restitution commentée',
    ],
    deliverable: 'Un état des lieux de vos achats et les gisements d’économie prioritaires.',
    idealFor: 'Vos prix d’achat montent et vous ne savez pas si vous pouvez obtenir mieux.',
  },
  'rest-supply-2': {
    delay: '3 à 5 semaines',
    format: 'Mission avec ateliers',
    includes: [
      'Grille de comparaison des fournisseurs',
      'Seuils de stock et de commande par famille',
      'Routines de réception et d’inventaire',
      'Arguments pour vos négociations',
    ],
    deliverable: 'Un plan fournisseurs et des règles de stock prêtes à appliquer.',
    idealFor: 'Vous êtes en rupture sur certains produits et en surstock sur d’autres.',
  },
  'rest-supply-3': {
    delay: 'Mensuel',
    format: 'Suivi à distance avec un point mensuel',
    includes: [
      'Suivi des prix et des écarts d’inventaire',
      'Ajustement des seuils',
      'Alertes sur les dérives',
      'Bilan mensuel',
    ],
    deliverable: 'Des approvisionnements suivis et ajustés chaque mois.',
    idealFor: 'Vous voulez garder la main sur vos achats dans la durée.',
  },
};
