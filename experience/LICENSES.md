# Licences et dépendances

Le code applicatif, les shaders, les styles et le SVG provisoire ont été écrits pour ce prototype. Les notices ci-dessous concernent les bibliothèques tierces. Le SVG officiel, lorsqu’il sera fourni, relève des droits de son titulaire.

| Dépendance directe | Version | Licence / notice |
| --- | --- | --- |
| React | 19.2.7 | MIT · licenses/react.txt |
| React DOM | 19.2.7 | MIT · licenses/react-dom.txt |
| Three.js | 0.183.2 | MIT · licenses/three.txt |
| GSAP et ScrollTrigger | 3.14.2 | [Standard no-charge license](https://gsap.com/standard-license/) |
| Vite (outil de compilation) | 8.3.6 | MIT · licenses/vite.md |

Les dépendances transitives exactes sont listées dans package-lock.json. Après npm ci, les notices des autres paquets sont disponibles dans leurs dossiers sous node_modules.

React DOM utilise aussi Scheduler, distribué sous MIT. Sa notice est incluse dans licenses/scheduler.txt.
