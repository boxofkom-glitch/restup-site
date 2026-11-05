# Brief pour Claude · RESTUP WebGL

Tu reprends le prototype RESTUP « The Growth Engine » fourni dans ce ZIP. Lis le README, lance npm ci puis npm run dev. La cible est une expérience courte de démonstration du pilotage d’un restaurant.

## Parcours à conserver

1. **Le chaos.** Le nuage violet, cyan et jaune répond au pointeur et accompagne la question sur la rentabilité.
2. **La maîtrise.** Les particules convergent vers le R. Remplace le fichier SVG provisoire par le SVG officiel lorsqu’il est fourni. Conserve ses proportions, sa silhouette, ses évidements et ses couleurs.
3. **Le pilotage.** Les particules deviennent quatre signaux. Affiche le chiffre d’affaires, le food cost, la masse salariale et l’EBITDA avec le libellé de démonstration fictive.
4. **La croissance.** Les signaux deviennent une flèche jaune ascendante. Le texte présente la rentabilité, les opérations, le management et le développement.

## Priorités de reprise

- Ajuster les seuils et la caméra dans la séquence GSAP après intégration du vrai SVG. Le monogramme doit rester lisible en défilant dans les deux sens.
- Tester sur de vrais téléphones et ajuster la densité des particules au besoin. Garder le défilement natif et le contenu lisible quand les animations sont coupées.
- Conserver le violet profond comme fond, le blanc chaud pour le texte, le jaune pour la progression et le cyan pour les données.
- Garder le périmètre d’un prototype. Les futures données réelles et la destination d’un éventuel appel à l’action de diagnostic restent à définir avec RESTUP.

## Recette de validation

- Exécuter npm ci et npm run build, puis ouvrir l’aperçu de production.
- Sur ordinateur, déplacer le pointeur dans la scène et parcourir les quatre étapes dans les deux sens. Sur mobile, vérifier que le visuel reste lisible et que les gestes tactiles laissent défiler la page.
- Tester la préférence « réduire les animations », le bouton ON/OFF, le clavier et le cas sans WebGL.
- Avec le SVG officiel, comparer le monogramme de particules à son rendu statique et vérifier le résultat à différentes tailles.
- Garder à jour le fichier de verrouillage et les notices si les dépendances changent.
