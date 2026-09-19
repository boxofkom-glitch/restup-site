// Moteur de PRÉ-REMPLISSAGE d'audit/plan (règles déterministes, sans IA).
// Produit un BROUILLON à partir des réponses d'onboarding ; le coach le corrige puis le valide.
(function (w) {
  // ---- Generation engine (rule-based, no AI) ----
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const PLAYBOOKS = {
    'Suivi de vos coûts (food cost, marges par plat)': {
      objective: "Reprendre le contrôle du food cost et clarifier les chiffres clés.",
      kpis: ["[HEBDO] Food cost moyen de la semaine", "[HEBDO] Nombre de couverts servis"],
      weeks: [
        ["Lister tous les plats de la carte avec leur coût matière réel.", "Créer un tableau de suivi food cost par plat.", "Former l'équipe cuisine au relevé des pertes."],
        ["Identifier les 3 plats les moins rentables.", "Ajuster les prix ou les portions en conséquence."],
        ["Recouper le food cost réel avec les commandes fournisseurs du mois.", "Repérer les postes de gaspillage principaux."],
        ["Point mensuel : revue des chiffres et ajustement du plan."]
      ]
    },
    'Organisation de l\'équipe (plannings, rôles clairs)': {
      objective: "Clarifier les rôles et fiabiliser l'organisation de l'équipe.",
      kpis: ["[HEBDO] Heures supplémentaires cumulées", "[HEBDO] Taux d'absentéisme"],
      weeks: [
        ["Lister les rôles et responsabilités actuels de chaque poste.", "Identifier les zones de flou ou de double-charge."],
        ["Formaliser un planning type par semaine (salle, cuisine).", "Définir un référent par service."],
        ["Mettre en place un point hebdo court avec l'équipe (15 min).", "Recueillir les irritants du terrain."],
        ["Ajuster l'organisation selon les retours et fixer la version stable."]
      ]
    },
    'Visibilité en ligne (Google, réseaux sociaux, avis)': {
      objective: "Reprendre la main sur votre visibilité en ligne.",
      kpis: ["[HEBDO] Nouveaux avis Google", "[HEBDO] Vues de la fiche établissement"],
      weeks: [
        ["Mettre à jour la fiche Google Business (photos, horaires, menu).", "Répondre aux avis récents."],
        ["Publier 2 photos/posts sur les réseaux sociaux.", "Mettre en place une relance avis client en fin de service."],
        ["Vérifier la cohérence des informations sur les annuaires (TripAdvisor, TheFork...)."],
        ["Bilan visibilité : évolution des vues et des avis sur le mois."]
      ]
    },
    'Fidélisation de vos clients': {
      objective: "Mettre en place les premiers leviers de fidélisation.",
      kpis: ["[HEBDO] Taux de clients récurrents", "[HEBDO] Nombre de contacts collectés"],
      weeks: [
        ["Définir un moyen simple de collecter les contacts clients (carte, newsletter).", "Former l'équipe en salle au sujet."],
        ["Lancer une offre de bienvenue pour les nouveaux clients.", "Identifier vos 10 meilleurs clients récurrents."],
        ["Tester un message de relance pour les clients inactifs depuis 2 mois."],
        ["Bilan fidélisation et ajustement de l'offre."]
      ]
    },
    'Suivi mensuel de vos chiffres': {
      objective: "Mettre en place un tableau de bord mensuel fiable.",
      kpis: ["[HEBDO] Trésorerie disponible", "[HEBDO] CA de la semaine"],
      weeks: [
        ["Rassembler le CA et les charges des 3 derniers mois.", "Définir la structure minimale du tableau de bord."],
        ["Mettre en place le suivi hebdo trésorerie.", "Identifier la source de chaque indicateur."],
        ["Compléter le tableau de bord avec le mois en cours."],
        ["Premier point mensuel chiffré complet avec le coach."]
      ]
    },
    'Clarté de vos objectifs chiffrés': {
      objective: "Traduire votre vision en objectifs chiffrés clairs.",
      kpis: ["[HEBDO] Avancement des objectifs du mois"],
      weeks: [
        ["Reformuler votre vision 12 mois en 3 chiffres clés.", "Partager ces objectifs avec l'équipe si pertinent."],
        ["Découper l'objectif 12 mois en paliers trimestriels."],
        ["Identifier les 2 leviers qui ont le plus d'impact sur ces objectifs."],
        ["Valider le plan d'objectifs avec le coach et ajuster si besoin."]
      ]
    }
  };

  function buildPillars(ratings) {
    const axisDefs = [
      { name: 'Structure & opérations', crits: ['struct1', 'struct2'] },
      { name: 'Acquisition & Vente', crits: ['acq1', 'acq2'] },
      { name: 'Vision & Pilotage', crits: ['vis1', 'vis2'] }
    ];
    return axisDefs.map(ax => {
      const criteria = ax.crits.map(key => ratings[key]);
      const avgPct = criteria.reduce((a, c) => a + c.pct, 0) / criteria.length;
      return { name: ax.name, score: Math.round((avgPct / 100) * 4 * 10) / 10, max: 4, criteria: criteria.map(c => ({ label: c.label, status: c.status, pct: c.pct })) };
    });
  }

  function weakestCriterion(ratings) {
    return Object.values(ratings).sort((a, b) => a.pct - b.pct)[0];
  }

  function buildAudit(f, ratings) {
    const gross = f.price > 0 ? Math.round((f.price - f.cost) / f.price * 100) : null;
    const competitors = [];
    if (f.c1name) competitors.push({ name: f.c1name, offer: f.c1offer, our_advantage: f.c1our, their_advantage: f.c1their });
    if (f.c2name) competitors.push({ name: f.c2name, offer: f.c2offer, our_advantage: f.c2our, their_advantage: f.c2their });
    const avgSale = Math.round((f.ticketLunch + f.ticketDinner) / 2);
    return {
      company_name: f.company, contact_name: f.contact, establishment_type: f.type, seats: f.seats, opening_hours: f.hours, company_description: f.desc,
      overview: { revenue: f.revenue, employees: f.employees, fixed_costs: f.fixedcosts, avg_sale: avgSale, margin_pct: f.margin, cash: f.cash },
      restaurant_metrics: { food_cost_pct: f.foodcost, payroll_pct: f.payroll, covers_per_week: f.covers, avg_ticket_lunch: f.ticketLunch, avg_ticket_dinner: f.ticketDinner },
      team: { turnover_count: f.turnover, avg_tenure_months: f.tenure, hardest_role: f.hardestrole },
      acquisition: { main_channel: f.channel, google_rating: f.grating, google_reviews: f.greviews, recurring_clients_pct: f.recurring, platforms: f.platforms },
      main_product: { name: f.prodname, tag: f.prodtag, price_ht: f.price, direct_cost: f.cost, gross_margin_pct: gross, net_margin_pct: f.margin, weekly_volume: f.prodvolume },
      financial_history: [{ year: 'Année N', revenue: f.revenue, gross_margin_pct: gross, net_result_pct: f.margin, net_debt: null, cash: f.cash }],
      competitors,
      market_opportunities: f.opps.split('\n').map(s => s.trim()).filter(Boolean),
      growth_journey: { story: f.story, vision_12m: f.vision, objective_4m: f.obj4m, blocker: f.blocker, solutions: f.solutions },
      pillars: buildPillars(ratings)
    };
  }

  function buildPlan(f, audit, ratings) {
    const targetRevenue = f.revenue * (1 + f.growth / 100);
    const targetMargin = Math.max(f.margin + 4, 10);
    const targetFoodCost = clamp(f.foodcost - 3, 20, 100);
    const foodCostSavings = f.revenue * 0.03;
    const targetPayroll = clamp(f.payroll - 2, 15, 100);
    const targetRecurring = clamp(f.recurring + 15, 0, 100);
    const targetRating = Math.min(f.grating + 0.3, 5).toFixed(1);
    const weak = weakestCriterion(ratings);
    const topCompetitor = audit.competitors[0];
    const topOpportunity = audit.market_opportunities[0];

    const vision12 = [
      `Atteindre ${fmt(targetRevenue)}€ de chiffre d'affaires annuel (+${f.growth}%) en sécurisant un flux de clients récurrents.`,
      `Réduire votre food cost de ${f.foodcost}% à ${targetFoodCost}%, soit environ ${fmt(foodCostSavings)}€ de marge récupérée sur l'année.`,
      `Optimiser votre masse salariale de ${f.payroll}% à ${targetPayroll}% du CA sans dégrader la qualité de service.`,
      `Réduire votre implication opérationnelle de ${f.involvNow}% à ${f.involvTarget}% grâce à une équipe autonome et des process clairs.`,
      `Faire passer votre taux de clients récurrents de ${f.recurring}% à ${targetRecurring}% grâce à un programme de fidélisation actif.`,
      `Stabiliser votre équipe pour réduire le turnover (actuellement ${f.turnover} départ${f.turnover > 1 ? 's' : ''} sur 12 mois), en particulier sur le poste de ${f.hardestrole || 'vos postes clés'}.`,
      topCompetitor ? `Renforcer votre avantage face à ${topCompetitor.name} en capitalisant sur : ${topCompetitor.our_advantage || 'vos points forts'}.` : `Mettre en place un tableau de bord mensuel complet (CA, marge, trésorerie) pour piloter sereinement la croissance.`
    ];
    if (f.extra) vision12.push(f.extra);

    const priorities4 = [
      `Mettre en place un suivi hebdomadaire du food cost et viser une première baisse de ${f.foodcost}% à ${clamp(f.foodcost - 1, 20, 100)}%.`,
      `Lancer un premier palier de délégation : passer de ${f.involvNow}% à ${Math.max(f.involvTarget, f.involvNow - 15)}% d'implication opérationnelle.`,
      `Passer de ${f.greviews} à ${f.greviews + 20} avis Google et viser une note de ${targetRating}/5, en structurant la demande d'avis en fin de service.`,
      `Clarifier vos indicateurs financiers clés (trésorerie, marge, panier moyen midi/soir).`,
      topOpportunity ? `Tester cette piste sur 4 semaines : ${topOpportunity}` : `Identifier et tester une nouvelle piste de développement.`,
      `Sécuriser le poste de ${f.hardestrole || 'vos postes clés'} pour limiter le risque de départ dans les 4 prochains mois.`,
      `Réaliser un premier point mensuel chiffré avec votre coach pour ajuster le plan.`,
      `Prioriser l'amélioration de : ${weak.label} (identifié comme le point le plus fragile).`
    ];

    const axes = [
      { name: 'Structure & opérations', subtitle: 'Optimisation structurelle',
        situation: `${ratings.struct1.label} : ${ratings.struct1.status}. ${ratings.struct2.label} : ${ratings.struct2.status}. Food cost actuel : ${f.foodcost}%. Masse salariale : ${f.payroll}%. Turnover : ${f.turnover} départ(s)/12 mois.`,
        actions: [PLAYBOOKS[ratings.struct1.label].objective, PLAYBOOKS[ratings.struct2.label].objective] },
      { name: 'Acquisition & Vente', subtitle: 'Performance commerciale',
        situation: `${ratings.acq1.label} : ${ratings.acq1.status}. ${ratings.acq2.label} : ${ratings.acq2.status}. Canal principal : ${f.channel || 'non précisé'}. Note Google : ${f.grating}/5 (${f.greviews} avis). Clients récurrents estimés : ${f.recurring}%.`,
        actions: [PLAYBOOKS[ratings.acq1.label].objective, PLAYBOOKS[ratings.acq2.label].objective] },
      { name: 'Vision & Pilotage', subtitle: 'Direction stratégique',
        situation: `${ratings.vis1.label} : ${ratings.vis1.status}. ${ratings.vis2.label} : ${ratings.vis2.status}.`,
        actions: [PLAYBOOKS[ratings.vis1.label].objective, PLAYBOOKS[ratings.vis2.label].objective] }
    ];

    const playbook = PLAYBOOKS[weak.label];
    const month1 = {
      name: 'Mois 1', current: true, objective: playbook.objective, kpis: playbook.kpis,
      weeks: playbook.weeks.map((tasks, i) => ({
        label: `Semaine ${i + 1}`, locked: i > 0,
        tasks: tasks.map(t => ({ text: t, done: false }))
      }))
    };

    return {
      contract_months: f.contract,
      vision_12m: { title: 'Objectifs pour les 12 prochains mois', items: vision12.map(t => ({ text: t, done: false })) },
      priorities_4m: { title: 'Objectifs pour les 4 prochains mois', items: priorities4.map(t => ({ text: t, done: false })) },
      axes,
      cycles: [
        { name: 'Cycle 1', active: true, months: [month1, { name: 'Mois 2', weeks: [] }, { name: 'Mois 3', weeks: [] }, { name: 'Mois 4', weeks: [] }] },
        { name: 'Cycle 2', active: false, months: [] },
        { name: 'Cycle 3', active: false, months: [] }
      ]
    };
  }


  w.restupBuildDraft = function (answers) {
    const f = answers.f, ratings = answers.ratings;
    const audit = buildAudit(f, ratings);
    const plan = buildPlan(f, audit, ratings);
    return { audit, plan };
  };
})(window);
