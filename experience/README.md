# RESTUP · The Growth Engine

Prototype interactif en français sur le pilotage d’un restaurant. Le défilement relie quatre états dans une même scène WebGL. Le nuage réagit au pointeur, se rassemble en monogramme R, s’organise en quatre signaux puis dessine une flèche ascendante. Les chiffres affichés sont fictifs.

## Installation

Prérequis : Node.js 22.12 ou supérieur et npm. Décompresser le ZIP, puis ouvrir un terminal dans le dossier contenant package.json.

~~~sh
npm ci
npm run dev
~~~

Ouvrir l’adresse affichée dans le terminal. Pour vérifier la version de production :

~~~sh
npm run build
npm run preview
~~~

Le dossier dist/ est aussi livré précompilé. Pour le publier, servir son contenu avec un serveur HTTP statique. Pour l’aperçu local, passer par npm run preview.

## Intégrer le SVG officiel

Remplacer public/restup-monogram.svg par le fichier officiel en gardant ce nom, puis relancer le build. Utiliser un SVG autonome avec un viewBox serré autour du motif, une silhouette opaque sur fond transparent et des couleurs intégrées. Convertir les éventuels textes en tracés pour conserver leur apparence. Le rendu échantillonne les pixels visibles du fichier pour former les particules, en conservant les proportions, les évidements et les couleurs comme base du shader. Le SVG lui-même sert d’affichage statique. Le R fourni a été dessiné pour ce prototype.

## Organisation

| Fichier | Rôle |
| --- | --- |
| src/main.jsx | Chapitres, indicateurs fictifs et séquence GSAP ScrollTrigger |
| src/particles.js | Échantillonnage du SVG, nuage WebGL, quatre cibles et interaction au pointeur |
| src/style.css | Direction artistique, mise en page et adaptation mobile |
| public/restup-monogram.svg | Emplacement du monogramme officiel |
| package-lock.json | Versions exactes et dépendances transitives |
| LICENSES.md et licenses/ | Conditions des bibliothèques et notices |
| BRIEF_CLAUDE.md | Contexte, priorités et vérifications pour la reprise |

La scène utilise WebGL 2. Sur mobile, le nombre de particules et la résolution de rendu sont réduits. Si WebGL échoue, si le système préfère les animations réduites ou si le visiteur coupe les animations, le SVG reste visible et le contenu reste accessible.
