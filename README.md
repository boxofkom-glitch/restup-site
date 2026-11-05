# Site RESTUP

Site vitrine B2B de RESTUP : accueil, répertoire des dix divisions, dix fiches avec prestations,
offres, à propos, demande de diagnostic, contact, confirmation, pages légales et 404.
Construit avec Astro 7 et Tailwind 4 (base AstroWind), en rendu statique. L'espace client
historique (`public/portail`) n'est pas modifié ; son mode d'emploi est dans
[docs/portail-mode-emploi.md](docs/portail-mode-emploi.md).

## Commandes

| Commande                      | Rôle                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `npm ci`                      | Installer les dépendances (Node ≥ 22.22.3)                                 |
| `npm run dev`                 | Serveur de développement sur http://localhost:4321 (mode prévisualisation) |
| `npm run build:preview`       | Compiler la prévisualisation (catalogue interne visible, tout en noindex)  |
| `npm run build:production`    | Compiler la production (bloquée tant que les mentions légales manquent)    |
| `npm run preview`             | Servir le dernier build sur http://localhost:4321                          |
| `npm run leads:server`        | Serveur local des demandes sur http://localhost:8787 (SQLite + file)       |
| `npm run leads:admin -- list` | Suivi local des demandes (`show`, `status`, `delete`, `queue`)             |
| `npm test`                    | Tests automatisés (serveur de demandes, builds preview et production)      |
| `npm run check`               | Vérification Astro, ESLint et Prettier                                     |

### Prévisualiser le parcours complet en local

```sh
cp .env.example .env
# dans .env : PUBLIC_LEADS_ENDPOINT=http://localhost:8787/api/leads
npm run leads:server                # terminal 1
npm run build:preview && npm run preview   # terminal 2
```

Ouvrir http://localhost:4321, aller sur une division, cliquer « Demander un devis », envoyer le
formulaire : la page /merci s'affiche après l'enregistrement. `npm run leads:admin -- list` montre la
demande ; les e-mails d'accusé et de notification sont déposés dans `.data/outbox`.

## Publication et tarifs

`src/data/catalogue.json` contient les dix divisions et les trente prestations, avec leurs statuts
(`contentStatus`, `serviceStatus`, `priceStatus`) et leurs **tarifs internes**. Ce fichier n'est lu
qu'au moment de la compilation (`src/lib/catalogue.ts`) : seule une projection autorisée arrive dans
les pages.

| Statut                                 | `preview`                                      | `production`                                          |
| -------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Prestation et tarif à valider          | Carte + fourchette « Tarif indicatif interne » | Absente du HTML ; fiche « Disponibilité à confirmer » |
| Prestation approuvée, tarif en attente | Fourchette + statut                            | Carte « Sur devis »                                   |
| Prestation et tarif approuvés          | Fourchette                                     | Prix HT, unité, note de devis                         |
| Prestation approuvée sur devis         | « Sur devis »                                  | « Sur devis »                                         |

Pour publier une prestation : passer `serviceStatus` (et `priceStatus` si le prix est validé) à
`approved`. Pour indexer une fiche : passer `contentStatus` à `approved`. Mettre aussi à jour la
table `restup_lead_allowlist` (colonne `published`) si Supabase est utilisé.

Les fiches non validées restent accessibles depuis le menu, en `noindex` et hors sitemap. Toute la
prévisualisation est en `noindex`. La compilation de production échoue tant que les champs de
`LEGAL` dans `src/data/site.ts` sont vides.

## Formulaire et demandes

Contrat commun dans `src/lib/leads/schema.ts` (navigateur et serveur). Le navigateur valide, puis
envoie à `PUBLIC_LEADS_ENDPOINT` avec une clé d'idempotence (inchangée tant que le contenu est
identique). Il n'affiche jamais de succès sans réponse 200/201 de l'enregistrement. Sans adresse
configurée, il affiche « Le formulaire est temporairement indisponible ».

Réponses : 201 enregistrée, 200 même clé et même contenu (aucun doublon), 409 même clé et contenu
différent, 422 erreurs par champ, 429 limite de débit, 403 origine refusée, 503 stockage indisponible.

Deux adaptateurs :

- **Local** (`scripts/leads-server.ts`) : Node ≥ 22.18 sans dépendance, SQLite (`node:sqlite`),
  demande + notifications dans une transaction, file avec réservation atomique (pas de double envoi
  en traitement concurrent), reprises bornées (`NOTIFY_MAX_ATTEMPTS`), état « failed » avec alerte
  dans les logs, collecteur d'e-mails local. `LEADS_SIMULATE_FAILURE=1` simule une panne d'envoi.
- **Supabase** (`supabase/migrations/20261105_site_leads.sql`, **non appliqué**) : fonction
  `submit_lead` (rôle anon) qui reproduit les mêmes contrôles côté base, tables protégées par RLS et
  lisibles par les seuls administrateurs du portail, historique des états commerciaux. L'envoi des
  e-mails depuis la table `restup_lead_notifications` reste à brancher (fonction Edge ou tâche
  planifiée) avec le prestataire d'e-mail retenu.

### Configuration

| Variable                   | Rôle                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `RESTUP_MODE`              | `preview` ou `production`                                     |
| `PUBLIC_LEADS_ENDPOINT`    | Adresse d'envoi des demandes (vide = formulaire indisponible) |
| `PUBLIC_LEADS_ADAPTER`     | `http` (serveur local) ou `supabase`                          |
| `PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon (adaptateur supabase)                       |
| `LEADS_*`, `NOTIFY_*`      | Serveur local : port, base, origines, débit, file, adresses   |

Voir [.env.example](.env.example). Aucun secret ne doit être commité ni exposé au navigateur.

## Déploiement et retour arrière

`.github/workflows/deploy.yml` compile en **production** et publie sur GitHub Pages à chaque push sur
`main`. Tant que les mentions légales manquent, la compilation échoue et la version en ligne reste
inchangée. Retour arrière : relancer le workflow sur le commit précédent (Actions › Mise en ligne ›
Run workflow) ou `git revert`. Les demandes sont stockées hors du site (SQLite local ou Supabase) :
un retour arrière du site ne les touche pas.

GitHub Pages ne permet pas de redirections 301 : les anciennes adresses (`/offre.html`,
`/methode.html`, …) redirigent par balise `refresh` avec `noindex`. Pour de vraies 301, un hébergement
avec règles de redirection (Netlify, Cloudflare Pages, Vercel) sera nécessaire.

## Documents

- [docs/recette.md](docs/recette.md) : tableau R01 à R25, ce qui a été vérifié et comment.
- [docs/publication.md](docs/publication.md) : décisions ouvertes et informations à fournir avant mise en ligne.
- `docs/references/RESTUP-Reference-DA.png` : référence de direction artistique.
