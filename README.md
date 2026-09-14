# RestUp — Mode d'emploi

Tout le site est déjà codé : pages publiques (Accueil, Méthode, Offre, Contact)
+ portail client (connexion, création de compte, tableau de bord) + votre
propre espace coach pour tout piloter.

**L'essentiel tient en 2 étapes** (Étape 1 + Étape 2 ci-dessous, ~15-20 min,
copier-coller uniquement, aucune compétence technique requise) : le site est
alors en ligne avec un vrai compte client fonctionnel. Toutes les autres
étapes (marquées "optionnel") ajoutent des briques utiles — audit et plan
d'action détaillés, messagerie, votre espace coach pour tout gérer sans
toucher au code — à faire quand vous en avez besoin, pas forcément le
premier jour.

---

## Étape 1 — Créer la base de données du portail (Supabase, gratuit)

1. Allez sur https://supabase.com et créez un compte gratuit.
2. Cliquez sur "New project", donnez-lui un nom (ex: `restup`), choisissez un
   mot de passe de base de données (notez-le), validez.
3. Une fois le projet créé, allez dans **Project Settings > API**.
4. Copiez les deux valeurs suivantes :
   - **Project URL**
   - **anon public key**
5. Ouvrez le fichier `portail/supabase-client.js` dans un éditeur de texte
   (même le Bloc-notes suffit) et remplacez :
   ```
   const SUPABASE_URL = "REMPLACEZ_PAR_VOTRE_PROJECT_URL";
   const SUPABASE_ANON_KEY = "REMPLACEZ_PAR_VOTRE_ANON_KEY";
   ```
   par vos deux valeurs copiées, entre les guillemets.
6. Sauvegardez le fichier.

C'est tout pour la base de données — la connexion et la création de compte
fonctionnent déjà avec ça. Le tableau de bord (audit, plan d'action, calls,
messages) a besoin de quelques tables en plus — voir l'Étape 1bis juste
après, puis l'Étape 1quinquies pour votre propre espace coach.

---

## Étape 1bis — Audit + Plan d'action détaillés, et historique des calls (optionnel)

Le tableau de bord a trois nouveaux onglets : **Audit** (le diagnostic complet
de l'entreprise du client), **Plan d'action** (objectifs stratégiques + plan
en cycles de 4 mois, semaine par semaine, à cocher) et **Calls** (historique
+ prise de rendez-vous). Tant que vous n'avez pas fait ce qui suit, ces
onglets affichent un état "vide" propre — rien ne casse, mais le contenu
n'apparaîtra qu'une fois les tables créées.

### La façon automatique (recommandée) — le client fait son propre audit

Le fichier `portail/audit-form.html` est un questionnaire en 9 étapes que le
client remplit lui-même depuis son espace (bouton "Faire mon auto-audit"
visible tant que son audit n'existe pas). À la fin, **tout se génère
automatiquement, sans IA et sans coût** :
- son Audit complet (chiffres, concurrence, parcours, score sur les 3 piliers),
- au moins **7 objectifs structurels sur 12 mois** et **7 sur 4 mois**,
  calculés avec ses propres chiffres (ex : "+30% de CA" devient son CA actuel
  × 1,3, automatiquement),
- une première semaine de tâches concrètes, choisie automatiquement selon
  son point le plus fragile (food cost, visibilité en ligne, organisation
  d'équipe...).

Vous n'avez rien à faire pour cette partie — c'est le client qui déclenche
tout. Vous gardez la main pour la suite : débloquer les semaines suivantes
(passer `locked` à `false` dans la table `plans`), compléter les mois 2 à 4,
et débloquer les cycles suivants (`active: true`) au fil de l'accompagnement.

*(Cette automatisation est volontairement basée sur des modèles de phrases
paramétrés par les chiffres du client, pas sur une IA générative — donc
aucun coût variable, aucune clé API à gérer. Si un jour vous voulez que les
semaines 2 à 12 mois se génèrent aussi automatiquement à partir d'un texte
libre ou d'une transcription d'appel, ça demande une vraie IA connectée en
sécurité côté serveur — reparlez-m'en, c'est une étape à part.)*

### La façon manuelle (si vous préférez garder la main à 100%)

Après votre audit avec un client, vous copiez le modèle JSON ci-dessous,
vous le remplissez avec les vraies informations du client (dans un éditeur
de texte, ou directement dans Supabase), puis vous le collez dans la table
correspondante. Ça demande un peu plus de manipulation, mais aucune ligne de
code à écrire — uniquement remplacer des valeurs entre guillemets.

### 1. Créer les tables

Dans Supabase, onglet **SQL Editor**, collez et exécutez ceci :

```sql
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.audits enable row level security;
create policy "Clients voient leur audit" on public.audits for select using (auth.uid() = user_id);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.plans enable row level security;
create policy "Clients voient leur plan" on public.plans for select using (auth.uid() = user_id);
create policy "Clients cochent leurs tâches" on public.plans for update using (auth.uid() = user_id);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  scheduled_at timestamptz,
  status text not null default 'requested',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.calls enable row level security;
create policy "Clients voient leurs calls" on public.calls for select using (auth.uid() = user_id);
create policy "Clients demandent un call" on public.calls for insert with check (auth.uid() = user_id);
```

### 2. Trouver l'identifiant du client

Dans Supabase, onglet **Authentication > Users**, trouvez le client (par son
email) et copiez son **User UID** (une longue suite de lettres/chiffres).
C'est la valeur `user_id` à utiliser dans les deux étapes suivantes.

### 3. Remplir l'audit

Onglet **Table Editor** > table `audits` > "Insert row". Collez le `user_id`
du client, puis dans la colonne `data`, collez ce modèle en remplaçant
chaque valeur par les vraies informations recueillies pendant l'audit :

```json
{
  "company_name": "Le Petit Bistrot SARL",
  "contact_name": "Marie Dubois",
  "company_description": "Le Petit Bistrot est un restaurant traditionnel de 35 couverts situé à Lyon, ouvert midi et soir du mardi au samedi. La carte change au fil des saisons, avec un positionnement produits frais et circuits courts.",
  "overview": {
    "revenue": 420000,
    "employees": 6,
    "fixed_costs": 310000,
    "avg_sale": 32,
    "margin_pct": 8,
    "cash": 18000
  },
  "main_product": {
    "name": "Menu du midi",
    "tag": "Best-seller",
    "price_ht": 22,
    "direct_cost": 7,
    "gross_margin_pct": 68,
    "net_margin_pct": 12
  },
  "financial_history": [
    { "year": "Année N", "revenue": 420000, "gross_margin_pct": 68, "net_result_pct": 8, "net_debt": 45000, "cash": 18000 },
    { "year": "Année N-1", "revenue": 405000, "gross_margin_pct": 65, "net_result_pct": 6, "net_debt": 52000, "cash": 9000 },
    { "year": "Année N-2", "revenue": 390000, "gross_margin_pct": 63, "net_result_pct": 5, "net_debt": 58000, "cash": 4000 }
  ],
  "competitors": [
    { "name": "Restaurant du Marché", "offer": "Prix similaires", "our_advantage": "Produits en circuit court, forte identité locale", "their_advantage": "Terrasse plus grande" }
  ],
  "market_opportunities": [
    "Développer la vente à emporter le midi pour capter les actifs du quartier.",
    "Proposer des offres traiteur pour événements privés en complément du service classique."
  ],
  "growth_journey": {
    "story": "Reprise d'un restaurant familial, envie de préserver un savoir-faire artisanal.",
    "vision_12m": "500 000€ de CA avec une marge nette stabilisée au-dessus de 12%.",
    "objective_4m": "Réduire le food cost de 3 points et remplir la salle en semaine.",
    "blocker": "Pas de suivi précis des coûts matière, décisions à l'instinct.",
    "solutions": "Mettre en place un tableau de suivi hebdomadaire du food cost."
  },
  "pillars": [
    { "name": "Structure & opérations", "score": 2, "max": 4, "criteria": [
      { "label": "Suivi du food cost", "status": "Critique", "pct": 15 },
      { "label": "Plannings et staff", "status": "En cours", "pct": 50 }
    ]},
    { "name": "Acquisition & Vente", "score": 2.5, "max": 4, "criteria": [
      { "label": "Présence en ligne", "status": "En cours", "pct": 45 },
      { "label": "Fidélisation clients", "status": "Bon", "pct": 70 }
    ]},
    { "name": "Vision & Pilotage", "score": 1.5, "max": 4, "criteria": [
      { "label": "Tableau de bord mensuel", "status": "Critique", "pct": 10 },
      { "label": "Objectifs chiffrés", "status": "En cours", "pct": 40 }
    ]}
  ]
}
```

**Guide des champs** : `overview` = les 6 chiffres clés affichés en haut de
l'audit. `main_product` = votre plat/offre phare et sa rentabilité.
`financial_history` = jusqu'à 3 années de recul (mettez `null` pour une
valeur inconnue). `competitors` = autant de concurrents que vous voulez.
`pillars` = le score sur 3 axes (`status` accepte : `Critique`, `En cours`,
`Bon`, `Excellent`).

### 4. Remplir le plan d'action

Même principe, table `plans`, colonne `data` :

```json
{
  "contract_months": 4,
  "vision_12m": {
    "title": "Objectifs pour les 12 prochains mois",
    "items": [
      { "text": "Atteindre 500 000€ de CA annuel avec une marge nette stable au-dessus de 12%.", "done": false },
      { "text": "Structurer la vente à emporter comme second canal de revenu.", "done": false }
    ]
  },
  "priorities_4m": {
    "title": "Objectifs pour les 4 prochains mois",
    "items": [
      { "text": "Mettre en place un suivi hebdomadaire du food cost.", "done": false },
      { "text": "Tester une offre à emporter sur 4 semaines.", "done": false }
    ]
  },
  "axes": [
    { "name": "Structure & opérations", "subtitle": "Optimisation structurelle",
      "situation": "Aucun suivi régulier des coûts matière, les commandes se font à l'instinct.",
      "actions": ["Créer un tableau de suivi food cost par plat", "Former l'équipe cuisine au relevé des pertes"] },
    { "name": "Acquisition & Vente", "subtitle": "Performance commerciale",
      "situation": "Peu de visibilité en dehors du bouche-à-oreille.",
      "actions": ["Mettre à jour la fiche Google Business", "Lancer une offre de lancement pour la vente à emporter"] },
    { "name": "Vision & Pilotage", "subtitle": "Direction stratégique",
      "situation": "Pas de tableau de bord, décisions prises dans l'urgence.",
      "actions": ["Mettre en place un point mensuel chiffres avec le coach"] }
  ],
  "cycles": [
    {
      "name": "Cycle 1", "active": true,
      "months": [
        {
          "name": "Mois 1", "current": true,
          "objective": "Reprendre le contrôle du food cost et clarifier les chiffres clés.",
          "weeks": [
            { "label": "Semaine 1", "locked": false, "tasks": [
              { "text": "Lister tous les plats de la carte avec leur coût matière réel.", "done": false },
              { "text": "Créer le tableau de suivi food cost (modèle fourni par le coach).", "done": false }
            ]},
            { "label": "Semaine 2", "locked": true, "tasks": [
              { "text": "Identifier les 3 plats les moins rentables et proposer un ajustement.", "done": false }
            ]},
            { "label": "Semaine 3", "locked": true, "tasks": [
              { "text": "Mettre à jour la fiche Google Business avec photos et horaires.", "done": false }
            ]},
            { "label": "Semaine 4", "locked": true, "tasks": [
              { "text": "Point mensuel : revue des chiffres et ajustement du plan.", "done": false }
            ]}
          ],
          "kpis": ["[HEBDO] Food cost moyen de la semaine", "[HEBDO] Nombre de couverts servis"]
        }
      ]
    },
    { "name": "Cycle 2", "active": false, "months": [] },
    { "name": "Cycle 3", "active": false, "months": [] }
  ]
}
```

**Guide des champs** : `locked: true` masque la semaine au client (jusqu'à
ce que vous passiez la valeur à `false` la semaine venue — ça évite qu'il
voie tout le plan d'un coup et se sente débordé). `active: true` sur un
cycle le rend visible et navigable ; les cycles suivants restent verrouillés
tant que vous ne passez pas `active` à `true`. `current: true` sur un mois
détermine celui affiché par défaut et utilisé pour le calcul "Actions ce
mois" du tableau de bord.

**Pour cocher une case à la place du client** (ou la décocher), changez
simplement `"done": false` en `"done": true` dans le JSON et sauvegardez —
mais normalement, c'est le client qui le fait lui-même depuis son espace.

### 5. Confirmer un call

Onglet "Table Editor" > `calls` > modifiez la ligne demandée, mettez
`status` à `confirmed` et remplissez `scheduled_at` (date + heure). Après le
call, repassez `status` à `done` et ajoutez vos notes dans `notes` — le
client les verra dans son historique.

## Étape 1ter — Connexion Google + établissement (optionnel)

1. **Connexion avec Google** : dans Supabase, "Authentication" > "Providers"
   > activez "Google". Suivez le lien vers Google Cloud Console pour créer
   un identifiant OAuth (Google vous guide, ~10 min), collez le Client ID
   et le Client Secret dans Supabase. Le bouton "Continuer avec Google" du
   site fonctionne alors sans rien changer au code.
2. **Auto-complétion d'adresse d'établissement** (à l'inscription) :
   créez une clé "Places API" sur
   https://console.cloud.google.com/google/maps-apis, puis ouvrez
   `portail/config.js` et remplacez `GOOGLE_MAPS_API_KEY`. Sans cette
   clé, le champ reste un simple texte libre — rien ne casse.

## Vidéo de présentation (optionnel)

La page d'accueil a une section vidéo juste sous le premier écran. Tant que
vous n'avez pas de vidéo, elle affiche un message "bientôt disponible" —
rien ne casse. Pour l'activer :

1. Mettez votre vidéo en ligne sur YouTube ou Vimeo (ou hébergez un fichier
   .mp4 quelque part).
2. Ouvrez `video-config.js` (à la racine du site) et remplacez
   `INTRO_VIDEO_URL` par le lien de votre vidéo.
3. Sauvegardez, re-glissez le dossier dans Netlify. La vidéo s'affiche
   avec un bouton "lecture" — elle ne se charge qu'au clic, pour ne pas
   ralentir la page.

## Étape 1quater — Réservation de call synchronisée (Cal.com, optionnel)

Pour que le client réserve un créneau qui s'ajoute automatiquement à VOTRE
Google Agenda et au sien (au lieu du formulaire de demande simple) :

1. Créez un compte gratuit sur https://cal.com et connectez-y votre Google
   Agenda (Settings > Apps > Google Calendar).
2. Créez un type d'événement (ex : "Point hebdo — 30 min"), copiez son
   lien (ex : `https://cal.com/votre-nom/point-hebdo`).
3. Ouvrez `portail/config.js` et remplacez `CALCOM_BOOKING_URL` par ce
   lien. L'onglet "Calls" du client affiche alors le calendrier Cal.com
   directement, avec synchronisation automatique des deux côtés.

---

## Étape 1quinquies — Espace coach (admin)

Jusqu'ici, pour construire le plan d'action d'un client, débloquer une
semaine ou répondre à un message, il fallait aller modifier du JSON à la
main dans Supabase. Cette étape ajoute un **vrai espace coach** :
`portail/admin/index.html` (liste de tous vos clients) et
`portail/admin/client.html` (le détail d'un client — audit, plan d'action
avec formulaires, messagerie, calls). Tout se fait par formulaires, plus
besoin de toucher au JSON au quotidien.

**Sécurité** : ce n'est pas juste une page cachée — l'accès est vérifié
côté base de données (Row Level Security), donc même quelqu'un qui
devine l'URL `admin/index.html` sans être vous ne pourra rien voir ni
modifier.

### 1. Créer les tables

Dans Supabase, "SQL Editor", collez et exécutez ceci (en plus des tables de
l'Étape 1bis, à faire avant si ce n'est pas déjà fait) :

```sql
-- Table des administrateurs (coachs). Une seule ligne : la vôtre.
create table public.admins (
  user_id uuid primary key references auth.users(id)
);
alter table public.admins enable row level security;
create policy "On vérifie son propre statut admin" on public.admins for select using (auth.uid() = user_id);

-- Table des profils clients, synchronisée automatiquement avec les inscriptions
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  company_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Chacun voit son propre profil" on public.profiles for select using (auth.uid() = id);
create policy "Les admins voient tous les profils" on public.profiles for select using (exists (select 1 from public.admins where user_id = auth.uid()));

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, company_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'company_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table des messages (coach <-> client), persistants cette fois
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sender text not null check (sender in ('client', 'coach')),
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Le client voit ses messages" on public.messages for select using (auth.uid() = user_id);
create policy "Le client envoie ses messages" on public.messages for insert with check (auth.uid() = user_id and sender = 'client');
create policy "Les admins voient tous les messages" on public.messages for select using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Les admins envoient des messages" on public.messages for insert with check (exists (select 1 from public.admins where user_id = auth.uid()));

-- Donne aux admins un accès complet aux tables existantes (en plus de l'accès des clients à leurs propres lignes)
create policy "Les admins gèrent tous les audits" on public.audits for all using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Les admins gèrent tous les plans" on public.plans for all using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Les admins gèrent tous les calls" on public.calls for all using (exists (select 1 from public.admins where user_id = auth.uid()));
```

### 2. Rattraper vos clients déjà inscrits (si vous en avez)

Le déclencheur ci-dessus ne remplit `profiles` que pour les **nouvelles**
inscriptions. Si des clients avaient déjà un compte avant cette étape,
exécutez une fois cette requête pour les rattraper :

```sql
insert into public.profiles (id, email, company_name)
select id, email, raw_user_meta_data ->> 'company_name'
from auth.users
where id not in (select id from public.profiles);
```

### 3. Devenir administrateur (vous-même)

1. Onglet "Authentication" > "Users", retrouvez **votre propre compte**
   (créez-en un via `login.html` si vous n'en avez pas encore un pour
   vous-même) et copiez son "User UID".
2. Onglet "Table Editor" > table `admins` > "Insert row" > collez ce UID
   dans `user_id` > enregistrez.
3. Reconnectez-vous sur `login.html` : vous êtes redirigé automatiquement
   vers `admin/index.html` au lieu de l'espace client.

*(Aucun de vos clients n'a besoin de savoir que cette page existe — un
compte client normal est automatiquement redirigé vers son propre espace.)*

### 4. Utiliser l'espace coach

- **`admin/index.html`** : la liste de tous vos clients, avec pour chacun
  un indicateur "Audit fait ?" / "Plan créé ?" et son dernier call. Cliquez
  sur un client pour ouvrir sa fiche.
- **`admin/client.html`** : onglets Audit (lecture, avec un mode JSON brut
  si vous devez corriger un champ), Plan d'action (formulaires pour la
  vision 12 mois, les priorités 4 mois, les 3 axes, et le détail
  semaine par semaine — avec des boutons "Débloquer la semaine suivante" et
  "Activer le cycle suivant" pour ne plus avoir à toucher au JSON), Messages
  (vous répondez, le client voit la réponse en temps réel dans son espace),
  Calls (changez le statut, la date, ajoutez vos notes).

---

## Étape 2 — Mettre le site en ligne (Netlify, gratuit)

1. Allez sur https://app.netlify.com/drop
2. Faites glisser **le dossier entier `restup`** (celui qui contient
   `index.html`, `styles.css`, `portail/`, etc.) directement dans la page.
3. Netlify vous donne une adresse en quelques secondes
   (ex: `chic-site-123.netlify.app`). Le site est en ligne, testez-le.

Pour modifier le site plus tard : créez un compte Netlify (gratuit),
reliez ce site à votre compte, puis vous pourrez soit re-glisser un dossier
mis à jour, soit connecter un dépôt GitHub pour republier automatiquement.

---

## Étape 3 — Brancher votre nom de domaine (restup-accompagnement.fr)

1. Achetez `restup-accompagnement.fr` chez un registrar (OVH, Gandi...) — ~15€/an.
2. Dans Netlify : **Site settings > Domain management > Add a domain**,
   entrez `restup-accompagnement.fr`.
3. Netlify vous donne des valeurs DNS à copier-coller dans l'interface de
   votre registrar (Netlify affiche la procédure exacte, c'est un
   copier-coller de 2 champs).
4. Attendez quelques heures (propagation DNS) et votre site est accessible
   sur `https://restup-accompagnement.fr`.

---

## Modifier le contenu vous-même, à tout moment

Chaque page est un fichier `.html` normal, avec le texte directement lisible
dans le code. Pour changer un texte :
- ouvrez le fichier concerné (`index.html`, `offre.html`, etc.) avec un
  éditeur de texte,
- cherchez la phrase à changer (Ctrl+F),
- modifiez-la, sauvegardez,
- re-glissez le dossier dans https://app.netlify.com/drop (ou republiez
  depuis votre compte Netlify si vous l'avez connecté).

Si vous préférez un éditeur visuel (sans toucher au code) pour les pages
publiques uniquement, vous pouvez me redemander une version pensée pour
Webflow — mais le portail client (comptes, tableau de bord) restera toujours
en code, car aucun outil purement visuel ne gère des comptes utilisateurs
aussi simplement que ce qui est déjà fait ici.

---

## Formulaire de contact

Le formulaire de la page Contact ouvre actuellement la messagerie du
visiteur avec le message pré-rempli. Pour recevoir les messages directement
par email sans que le visiteur ait à confirmer l'envoi, créez un compte
gratuit sur https://formspree.io, et remplacez le contenu du `<script>` en
bas de `contact.html` par le code d'intégration qu'ils fournissent (quelques
lignes à copier-coller).

---

## Récapitulatif des comptes à créer

| Service | Pourquoi | Coût |
|---|---|---|
| Supabase | Comptes clients + base de données du portail | Gratuit pour démarrer |
| Netlify | Hébergement du site | Gratuit pour démarrer |
| OVH ou Gandi | Nom de domaine restup-accompagnement.fr | ~15€/an |
| Formspree (optionnel) | Recevoir le formulaire de contact par email | Gratuit pour démarrer |
| Google Cloud (optionnel) | Connexion Google + auto-complétion d'adresse | Gratuit (Maps a un quota gratuit mensuel) |
| Cal.com (optionnel) | Réservation de call synchronisée avec Google Agenda | Gratuit pour démarrer |
