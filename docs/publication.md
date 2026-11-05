# Avant la mise en ligne

La version actuelle est une **prévisualisation**. La mise en ligne reste bloquée tant que les points
ci-dessous ne sont pas confirmés par RESTUP. Chaque ligne indique où la renseigner.

## Bloquant

| À fournir ou décider                                                                                                               | Où                                                                             | Comportement en attendant                  |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Identité de l'éditeur : raison sociale, forme et capital, adresse, immatriculation, TVA, directeur de publication, contact vérifié | `src/data/site.ts` › `LEGAL`                                                   | Compilation de production refusée          |
| Hébergeur : nom, adresse, contact (GitHub Pages aujourd'hui)                                                                       | `LEGAL.host`                                                                   | Idem                                       |
| Confidentialité : responsable du traitement, contact droits, base légale, durée de conservation, sous-traitants                    | `LEGAL.privacy` + `src/pages/confidentialite.astro`                            | Idem                                       |
| Stockage des demandes en production (Supabase existant ?) et qui y accède                                                          | Appliquer `supabase/migrations/20261105_site_leads.sql`, puis `PUBLIC_LEADS_*` | Formulaire « temporairement indisponible » |
| Destinataire des demandes et prestataire d'e-mail (domaine d'envoi authentifié)                                                    | Envoi depuis `restup_lead_notifications` à construire                          | Aucun e-mail envoyé                        |
| Domaine canonique (`restup.solutions` ou `restup-accompagnement.fr` ?)                                                             | `src/config.yaml` › `site`, `public/CNAME`                                     | `https://restup.solutions`                 |

## Commercial

| À valider                                                                                | Où                                                                          |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Prestations réellement ouvertes, livrables, prix HT, unités, exclusions (30 prestations) | `src/data/catalogue.json` › `serviceStatus`, `priceStatus`, `internalPrice` |
| Fiches dont le contenu est validé (indexation)                                           | `contentStatus`                                                             |
| Délai de réponse public éventuel                                                         | Textes de `/merci` et de l'accusé                                           |
| Zones géographiques couvertes                                                            | Textes et données structurées                                               |

## Identité et contenus

| À fournir                                          | Usage                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Logo vectoriel (SVG) approuvé et éventuelle charte | Remplace le PNG de l'en-tête et le favicon                                                                         |
| Police de marque éventuelle                        | Remplace Archivo                                                                                                   |
| Comptes sociaux officiels                          | `LEGAL.socialLinks` (pied de page)                                                                                 |
| Bios, photos et rôles approuvés                    | Section « Vos interlocuteurs » de /a-propos (masquée)                                                              |
| Références clients, cas, logos tiers autorisés     | Non affichés aujourd'hui (les logos de l'ancien site sont conservés dans `src/assets/images/clients` mais retirés) |

## Optionnel (désactivé)

Mesure d'audience, CRM, agenda : aucun n'est installé. Les ajouter demande un choix de prestataire,
la mise à jour de /cookies et, si nécessaire, un module de consentement.
