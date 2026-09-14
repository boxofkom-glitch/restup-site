// TEMP — jeu de données de démonstration pour l'espace coach pendant les modifs.
// Utilisé uniquement quand la base réelle ne renvoie aucun client / aucune donnée.
// Pour retirer : supprimer ce fichier et les <script src="mock-clients.js"> qui le chargent.
(function () {
  window.MOCK_CLIENTS = [
    { id: 'mock-1', company_name: 'Le Petit Bouchon', email: 'contact@lepetitbouchon.fr', phone: '06 12 34 56 78', address: '14 rue des Tanneurs, 69005 Lyon', active: true, created_at: '2026-04-12T09:00:00Z',
      coach: 'Sarah Meunier', closer: 'Julien Farge', paid: true, amount_paid: 3000, months_paid: 6, calls_used: 5, calls_total: 12 },
    { id: 'mock-2', company_name: 'Sushi Sakura', email: 'hello@sushisakura.fr', phone: '07 65 43 21 09', address: '8 rue de la Roquette, 75011 Paris', active: true, created_at: '2026-06-03T09:00:00Z',
      coach: 'Sarah Meunier', closer: 'Camille Roy', paid: true, amount_paid: 2000, months_paid: 4, calls_used: 3, calls_total: 12 },
    { id: 'mock-3', company_name: 'Pizzeria Bella Napoli', email: 'bella.napoli@gmail.com', phone: '06 98 76 54 32', address: '22 cours Julien, 13006 Marseille', active: true, created_at: '2026-08-30T09:00:00Z',
      coach: 'Marc Antoine', closer: 'Julien Farge', paid: false, amount_paid: 0, months_paid: 0, calls_used: 0, calls_total: 12 },
    { id: 'mock-4', company_name: 'Burger House Deluxe', email: 'contact@burgerhousedeluxe.fr', phone: '06 11 22 33 44', address: '5 quai des Chartrons, 33000 Bordeaux', active: false, created_at: '2026-02-01T09:00:00Z',
      coach: 'Marc Antoine', closer: 'Camille Roy', paid: true, amount_paid: 3000, months_paid: 3, calls_used: 12, calls_total: 12 },
    { id: 'mock-5', company_name: 'Le Jardin Provençal', email: 'contact@jardinprovencal.fr', phone: '06 55 44 33 22', address: '3 place Richelme, 13100 Aix-en-Provence', active: true, created_at: '2026-08-28T09:00:00Z',
      coach: 'Sarah Meunier', closer: 'Julien Farge', paid: true, amount_paid: 1000, months_paid: 2, calls_used: 1, calls_total: 12 },
  ];

  window.MOCK_AUDITS = {
    'mock-1': {
      company_name: 'Le Petit Bouchon',
      contact_name: 'Marc Lefèvre',
      company_description: "Bistrot gastronomique de 34 couverts à Lyon, cuisine de saison, ouvert depuis 6 ans. Équipe de 7 personnes dont 3 en cuisine.",
      overview: { revenue: 612000, employees: 7, fixed_costs: 21400, avg_sale: 42, margin_pct: 64, cash: 18500 },
      financials: {
        day:   { ca: 1700, ca_prev: 1550, food_cost_pct: 29, food_cost_pct_prev: 31, payroll: 540, payroll_prev: 560, charges: 700, charges_prev: 710, net_profit: 134, net_profit_prev: 98 },
        week:  { ca: 11800, ca_prev: 10900, food_cost_pct: 29, food_cost_pct_prev: 31, payroll: 3760, payroll_prev: 3900, charges: 4950, charges_prev: 4970, net_profit: 940, net_profit_prev: 690 },
        month: { ca: 51000, ca_prev: 47500, food_cost_pct: 28, food_cost_pct_prev: 30, payroll: 16300, payroll_prev: 16800, charges: 21400, charges_prev: 21600, net_profit: 4080, net_profit_prev: 3000 },
        year:  { ca: 612000, ca_prev: 574000, food_cost_pct: 28, food_cost_pct_prev: 30, payroll: 195840, payroll_prev: 202000, charges: 256800, charges_prev: 259000, net_profit: 48960, net_profit_prev: 40200 },
      },
      main_product: { name: 'Menu du marché (3 plats)', tag: 'Offre phare du soir', price_ht: 39, direct_cost: 13, gross_margin_pct: 67, net_margin_pct: 22 },
      financial_history: [
        { year: 2024, revenue: 528000, gross_margin_pct: 62, net_result_pct: 6, net_debt: 45000, cash: 9200 },
        { year: 2025, revenue: 574000, gross_margin_pct: 63, net_result_pct: 7, net_debt: 38000, cash: 13800 },
        { year: 2026, revenue: 612000, gross_margin_pct: 64, net_result_pct: 8, net_debt: 31000, cash: 18500 },
      ],
      competitors: [
        { name: 'La Table de Léon', offer: 'Bistrot traditionnel, menu 32€', our_advantage: 'Carte plus créative, produits locaux', their_advantage: 'Emplacement centre-ville, notoriété' },
      ],
      market_opportunities: [
        'Développer une offre brunch le dimanche, créneau peu occupé par la concurrence directe.',
        'Proposer des accords mets-vins premium pour augmenter le ticket moyen.',
      ],
      growth_journey: {
        story: "Repreneur d'un bistrot familial il y a 6 ans, passionné de cuisine de saison.",
        vision_12m: "Stabiliser la rentabilité et ouvrir un second service le dimanche midi.",
        objective_4m: "Passer le ticket moyen de 42€ à 48€ et réduire le coût matière de 2 points.",
        blocker: "Trop de temps passé sur la gestion des plannings et des achats, au détriment de la carte.",
        solutions: "Formaliser les fiches techniques et déléguer la gestion des stocks au second de cuisine.",
      },
      pillars: [
        { name: 'Structure & opérations', score: 3, max: 4, criteria: [
          { label: 'Fiches techniques', status: 'Bon', pct: 75 },
          { label: 'Gestion des stocks', status: 'En cours', pct: 50 },
          { label: 'Planning équipe', status: 'Excellent', pct: 95 },
        ] },
        { name: 'Acquisition & Vente', score: 2, max: 4, criteria: [
          { label: 'Présence en ligne', status: 'Critique', pct: 20 },
          { label: 'Fidélisation clients', status: 'En cours', pct: 45 },
        ] },
        { name: 'Vision & Pilotage', score: 3, max: 4, criteria: [
          { label: 'Suivi des indicateurs', status: 'Bon', pct: 70 },
          { label: 'Objectifs clairs', status: 'Excellent', pct: 90 },
        ] },
      ],
    },
    'mock-2': {
      company_name: 'Sushi Sakura',
      contact_name: 'Yuki Tanaka',
      company_description: "Restaurant japonais de 28 couverts + vente à emporter, ouvert il y a 2 ans dans le 11e arrondissement de Paris.",
      overview: { revenue: 385000, employees: 5, fixed_costs: 15800, avg_sale: 27, margin_pct: 58, cash: 9400 },
      financials: {
        day:   { ca: 1050, ca_prev: 970, food_cost_pct: 32, food_cost_pct_prev: 34, payroll: 340, payroll_prev: 350, charges: 430, charges_prev: 435, net_profit: 70, net_profit_prev: 45 },
        week:  { ca: 7400, ca_prev: 6800, food_cost_pct: 32, food_cost_pct_prev: 34, payroll: 2380, payroll_prev: 2450, charges: 3020, charges_prev: 3040, net_profit: 490, net_profit_prev: 310 },
        month: { ca: 32000, ca_prev: 28500, food_cost_pct: 31, food_cost_pct_prev: 33, payroll: 10300, payroll_prev: 10500, charges: 15800, charges_prev: 15900, net_profit: 2100, net_profit_prev: 1250 },
        year:  { ca: 385000, ca_prev: 298000, food_cost_pct: 31, food_cost_pct_prev: 33, payroll: 123800, payroll_prev: 118000, charges: 189600, charges_prev: 175000, net_profit: 25300, net_profit_prev: 13400 },
      },
      main_product: { name: 'Plateau Sakura (assortiment 20 pièces)', tag: 'Best-seller livraison', price_ht: 24, direct_cost: 9.5, gross_margin_pct: 60, net_margin_pct: 16 },
      financial_history: [
        { year: 2025, revenue: 298000, gross_margin_pct: 54, net_result_pct: 4, net_debt: 52000, cash: 4100 },
        { year: 2026, revenue: 385000, gross_margin_pct: 58, net_result_pct: 9, net_debt: 44000, cash: 9400 },
      ],
      competitors: [
        { name: 'Tokyo Street', offer: 'Sushi rapide, formules déjeuner à 14€', our_advantage: 'Produits plus qualitatifs, chef formé au Japon', their_advantage: 'Prix plus bas, plus rapide en livraison' },
        { name: 'Umi Sushi', offer: 'Restaurant japonais haut de gamme', our_advantage: 'Rapport qualité-prix, ambiance décontractée', their_advantage: 'Image plus premium' },
      ],
      market_opportunities: [
        'La livraison représente déjà 40% du CA : optimiser le temps de préparation pour absorber plus de commandes aux heures de pointe.',
        'Lancer une offre traiteur pour événements d\'entreprise, peu exploitée dans le quartier.',
      ],
      growth_journey: {
        story: "Ancienne cheffe sushi dans un restaurant étoilé, s'est lancée seule il y a 2 ans.",
        vision_12m: "Doubler la capacité de production livraison sans dégrader la qualité en salle.",
        objective_4m: "Recruter et former un second chef pour sécuriser les pics d'activité du week-end.",
        blocker: "Dépendance à une seule personne (elle-même) pour la qualité constante des produits.",
        solutions: "Documenter les recettes précisément et mettre en place une période de formation encadrée.",
      },
      pillars: [
        { name: 'Structure & opérations', score: 2, max: 4, criteria: [
          { label: 'Fiches techniques', status: 'Critique', pct: 15 },
          { label: 'Gestion des stocks', status: 'Bon', pct: 70 },
        ] },
        { name: 'Acquisition & Vente', score: 4, max: 4, criteria: [
          { label: 'Présence en ligne', status: 'Excellent', pct: 100 },
          { label: 'Plateformes de livraison', status: 'Excellent', pct: 95 },
        ] },
        { name: 'Vision & Pilotage', score: 2, max: 4, criteria: [
          { label: 'Suivi des indicateurs', status: 'En cours', pct: 40 },
          { label: 'Objectifs clairs', status: 'Bon', pct: 65 },
        ] },
      ],
    },
    'mock-5': {
      company_name: 'Le Jardin Provençal',
      contact_name: 'Isabelle Roux',
      company_description: "Restaurant traditionnel provençal de 50 couverts avec terrasse, à Aix-en-Provence.",
      overview: { revenue: 495000, employees: 8, fixed_costs: 24000, avg_sale: 35, margin_pct: 55, cash: 7200 },
      main_product: { name: 'Formule terrasse (entrée + plat)', tag: 'Offre déjeuner', price_ht: 22, direct_cost: 8, gross_margin_pct: 58, net_margin_pct: 12 },
      financial_history: [
        { year: 2025, revenue: 460000, gross_margin_pct: 53, net_result_pct: 5, net_debt: 60000, cash: 5100 },
        { year: 2026, revenue: 495000, gross_margin_pct: 55, net_result_pct: 6, net_debt: 55000, cash: 7200 },
      ],
      competitors: [],
      market_opportunities: [
        'La terrasse est sous-exploitée le soir en semaine : envisager une offre apéritif-tapas.',
      ],
      growth_journey: {
        story: "Reprise familiale du restaurant il y a 4 ans.",
        vision_12m: "Améliorer la rentabilité de la terrasse en soirée.",
        objective_4m: "Tester une carte apéritif-tapas sur 2 mois.",
        blocker: "Peu de visibilité sur la rentabilité réelle par service (midi vs soir).",
        solutions: "Mettre en place un suivi de caisse séparé midi/soir.",
      },
      pillars: [
        { name: 'Structure & opérations', score: 3, max: 4, criteria: [
          { label: 'Fiches techniques', status: 'Bon', pct: 72 },
        ] },
        { name: 'Acquisition & Vente', score: 2, max: 4, criteria: [
          { label: 'Présence en ligne', status: 'En cours', pct: 48 },
        ] },
        { name: 'Vision & Pilotage', score: 1, max: 4, criteria: [
          { label: 'Suivi des indicateurs', status: 'Critique', pct: 20 },
        ] },
      ],
    },
  };

  // ---- Générateur de semaines à 7 tâches, pour un plan d'action bien rempli ----
  var TASK_POOL = [
    'Rédiger la fiche technique du plat du jour', 'Mettre à jour l\'inventaire de la cave à vin',
    'Former un commis aux normes HACCP', 'Réorganiser le poste chaud pour gagner en fluidité',
    'Renégocier les tarifs avec le fournisseur de viande', 'Standardiser les portions des entrées',
    'Auditer les pertes en fin de service', 'Mettre à jour le planning de l\'équipe cuisine',
    'Tester une nouvelle recette de dessert', 'Vérifier les dates de péremption en réserve',
    'Optimiser la rotation des stocks de légumes', 'Former le second aux commandes fournisseurs',
    'Publier 3 posts Instagram sur les plats de saison', 'Répondre aux avis Google de la semaine',
    'Mettre à jour la fiche Google Business', 'Lancer une offre déjeuner pour la semaine',
    'Relancer les clients inactifs par email', 'Créer une carte de fidélité simple',
    'Photographier les nouveaux plats pour le site', 'Tester une formule apéritif en terrasse',
    'Analyser les avis clients pour identifier les points faibles', 'Former l\'équipe à la vente additionnelle',
    'Mettre à jour le menu en ligne', 'Mettre à jour le tableau de suivi du chiffre d\'affaires',
    'Calculer la marge réelle du menu du marché', 'Faire le point hebdomadaire avec le coach',
    'Analyser les charges fixes du mois', 'Suivre l\'évolution du ticket moyen',
    'Vérifier la trésorerie disponible', 'Comparer les ventes à l\'objectif du mois',
  ];
  function genWeek(label, weekIdx, doneCount, locked, poolOffset) {
    var tasks = [];
    for (var i = 0; i < 7; i++) {
      var text = TASK_POOL[(poolOffset + weekIdx * 7 + i) % TASK_POOL.length];
      var task = { text: text, done: i < doneCount };
      if (i === 0) task.quickWin = true;
      tasks.push(task);
    }
    var week = { label: label, tasks: tasks };
    if (locked) week.locked = true;
    return week;
  }
  function genMonth(name, monthIdx, current, objective, kpis, doneCountsPerWeek, lockedFrom, poolOffset) {
    var weeks = [];
    for (var w = 0; w < 4; w++) {
      var doneCount = doneCountsPerWeek[w] != null ? doneCountsPerWeek[w] : 0;
      var locked = lockedFrom != null && w >= lockedFrom;
      weeks.push(genWeek('Semaine ' + (w + 1), monthIdx * 4 + w, locked ? 0 : doneCount, locked, poolOffset || 0));
    }
    return { name: name, current: !!current, objective: objective, kpis: kpis, weeks: weeks };
  }

  window.MOCK_PLANS = {
    'mock-1': {
      contract_months: 6,
      vision_12m: { title: 'Vision 12 mois — cap vers la duplication', items: [
        { text: 'Stabiliser la marge nette au-dessus de 12%', done: true },
        { text: 'Structurer entièrement les process de cuisine (fiches techniques, stocks, HACCP)', done: false },
        { text: 'Construire une équipe autonome capable de tourner sans le dirigeant au quotidien', done: false },
        { text: 'Développer une identité de marque reconnaissable (visuelle, ton, positionnement)', done: false },
        { text: 'Documenter un manuel opérationnel complet (recettes, procédures, standards de service)', done: false },
        { text: 'Valider un modèle économique rentable et réplicable sur un second établissement', done: false },
        { text: 'Poser les bases juridiques et financières d\'une franchise (contrat type, business plan structuré)', done: false },
      ] },
      priorities_4m: { title: 'Priorités 4 mois', items: [
        { text: 'Formaliser 15 fiches techniques prioritaires', done: true },
        { text: 'Mettre en place un tableau de bord hebdomadaire (CA, foodcost, masse salariale)', done: true },
        { text: 'Augmenter le ticket moyen à 48€', done: false },
        { text: 'Réduire la dépendance au chef sur les achats', done: false },
        { text: 'Recruter et former un second de cuisine autonome', done: false },
        { text: 'Lancer une carte de fidélité et une présence en ligne active', done: false },
        { text: 'Cadrer le concept sur papier (positionnement, offre, structure de coûts) en vue d\'une duplication', done: false },
      ] },
      axes: [
        { name: 'Structure & opérations', subtitle: 'Fiabiliser la cuisine', situation: 'Fiches techniques incomplètes, dépendance au chef.', actions: ['Rédiger les fiches techniques manquantes', 'Former le second de cuisine aux achats'] },
        { name: 'Acquisition & Vente', subtitle: 'Renforcer la visibilité', situation: 'Peu de présence en ligne, faible fidélisation.', actions: ['Créer une fiche Google Business complète', 'Lancer une carte de fidélité simple'] },
      ],
      cycles: [
        { name: 'Cycle 1', active: true, months: [
          genMonth('Mois 1', 0, false, 'Poser les bases du suivi', ['[CA] Suivi hebdomadaire du chiffre d\'affaires'], [7, 7, 7, 7]),
          genMonth('Mois 2', 1, true, 'Augmenter le ticket moyen', ['[Panier] Ticket moyen hebdomadaire'], [7, 7, 4, 0]),
          genMonth('Mois 3', 2, false, 'Fidéliser la clientèle régulière', ['[Fidélité] Nombre de cartes distribuées'], [0, 0, 0, 0]),
          genMonth('Mois 4', 3, false, 'Préparer l\'ouverture du dimanche midi', ['[Ouverture] Jours de test réalisés'], [0, 0, 0, 0], 1),
        ] },
        { name: 'Cycle 2', active: false, months: [] },
      ],
    },
    'mock-2': {
      contract_months: 4,
      vision_12m: { title: 'Vision 12 mois — cap vers la duplication', items: [
        { text: 'Doubler la capacité de production livraison', done: false },
        { text: 'Recruter et former un second chef autonome', done: false },
        { text: 'Standardiser 100% des recettes signatures', done: false },
        { text: 'Construire une marque livraison reconnaissable sur les plateformes', done: false },
        { text: 'Documenter un manuel de production complet', done: false },
        { text: 'Valider la rentabilité d\'un second point de vente ou dark kitchen', done: false },
        { text: 'Préparer un business plan structuré pour une franchise', done: false },
      ] },
      priorities_4m: { title: 'Priorités 4 mois', items: [
        { text: 'Documenter les recettes signatures', done: true },
        { text: 'Lancer le recrutement du second chef', done: true },
        { text: 'Optimiser le temps de préparation livraison', done: false },
        { text: 'Mettre en place un tableau de bord hebdomadaire (CA, foodcost, masse salariale)', done: false },
        { text: 'Former le second chef aux standards qualité', done: false },
        { text: 'Analyser la rentabilité par plateforme de livraison', done: false },
        { text: 'Cadrer le concept sur papier en vue d\'une duplication', done: false },
      ] },
      axes: [
        { name: 'Structure & opérations', subtitle: 'Sécuriser la production', situation: 'Toute la qualité repose sur une seule personne.', actions: ['Documenter 20 recettes clés', 'Mettre en place une période de doublage'] },
      ],
      cycles: [
        { name: 'Cycle 1', active: true, months: [
          genMonth('Mois 1', 0, true, 'Sécuriser le savoir-faire', ['[Recettes] Nombre de recettes documentées'], [7, 5, 0, 0], null, 11),
          genMonth('Mois 2', 1, false, 'Recruter et former le second chef', ['[Équipe] Entretiens réalisés'], [0, 0, 0, 0], 2, 11),
        ] },
      ],
    },
  };

  window.MOCK_MESSAGES = {
    'mock-1': [
      { sender: 'client', text: 'Bonjour, on a testé le nouveau menu dégustation ce week-end, très bons retours !', created_at: '2026-09-10T18:20:00Z' },
      { sender: 'coach', text: 'Super nouvelle ! On regarde ensemble les chiffres au prochain call jeudi ?', created_at: '2026-09-10T19:05:00Z' },
    ],
    'mock-2': [
      { sender: 'client', text: 'On a eu un pic de commandes vendredi soir, on a dû refuser du monde.', created_at: '2026-09-08T21:10:00Z' },
      { sender: 'coach', text: 'C\'est le signe qu\'il faut accélérer sur le recrutement. On en parle jeudi.', created_at: '2026-09-09T08:30:00Z' },
    ],
  };

  window.MOCK_CALLS = {
    'mock-1': [
      { id: 'mc-1', status: 'done', notes: 'Point sur les fiches techniques et le suivi CA.', scheduled_at: '2026-08-28T13:00:00Z' },
      { id: 'mc-2', status: 'confirmed', notes: 'Bilan du mois 2 et carte des vins.', scheduled_at: '2026-09-18T13:00:00Z' },
    ],
    'mock-2': [
      { id: 'mc-3', status: 'done', notes: 'Lancement du recrutement second chef.', scheduled_at: '2026-08-25T10:00:00Z' },
      { id: 'mc-4', status: 'requested', notes: 'Créneau souhaité : jeudi matin', scheduled_at: null },
    ],
  };
})();
