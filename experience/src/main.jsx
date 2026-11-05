import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);
const logo = import.meta.env.BASE_URL + 'restup-logo.png';
const metrics = [
  ['Chiffre d’affaires', '84 200 €', 'Ventes du mois'],
  ['Food cost', '28 %', 'Coût matières / CA'],
  ['Masse salariale', '32 %', 'Coût du personnel / CA'],
  ['EBITDA', '12 %', 'Marge opérationnelle brute'],
];

function App() {
  const story = useRef(null);
  const stage = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReady(false); setPlaying(!preference.matches); };
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const controller = new AbortController();
    let dispose;
    const host = stage.current;
    import('./particles.js').then(({ mountParticles }) => {
      if (controller.signal.aborted) return null;
      return mountParticles(host, logo, controller.signal, () => setReady(false));
    }).then((scene) => {
      if (!scene) return;
      if (controller.signal.aborted) {
        scene.dispose();
        return;
      }
      const animation = gsap.context(() => {
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: story.current, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
        })
          .to(scene.state, { morph: 1, orbit: 0, duration: 0.72 })
          .to(scene.state, { morph: 1, duration: 0.55 })
          .to(scene.state, { morph: 2, orbit: -0.12, duration: 0.55 })
          .to(scene.state, { morph: 2, duration: 0.5 })
          .to(scene.state, { morph: 3, orbit: 0, duration: 0.68 });

        gsap.utils.toArray('[data-reveal]', story.current).forEach((item) => {
          gsap.from(item, {
            y: 20, opacity: 0.45, duration: 0.55,
            scrollTrigger: { trigger: item, start: 'top 93%', toggleActions: 'play none none reverse' },
          });
        });
      }, story.current);
      dispose = () => {
        animation.revert();
        scene.dispose();
      };
      setReady(true);
    }).catch((error) => {
      if (!controller.signal.aborted) console.warn('RESTUP — affichage statique activé.', error);
    });
    return () => {
      controller.abort();
      dispose?.();
    };
  }, [playing]);

  return <>
    <a className="skip" href="#contenu">Aller au contenu</a>
    <header className="bar">
      <a className="brand" href="/" aria-label="RESTUP, retour au site"><span /> RESTUP<span className="brand-dot">.</span></a>
      <span className="header-label">THE GROWTH ENGINE</span>
      <button type="button" aria-pressed={playing} onClick={() => { setReady(false); setPlaying(!playing); }}>
        Animations <strong>{playing ? 'ON' : 'OFF'}</strong>
      </button>
    </header>
    <main id="contenu">
      <div className="story" ref={story}>
        <div className="visual" aria-hidden="true">
          <div className="stage">
            <div className="ring ring-outer" /><div className="ring ring-inner" />
            <div className="cross cross-left">+</div><div className="cross cross-right">+</div>
            <div className="canvas" ref={stage} />
            <img className={playing && ready ? 'static hidden' : 'static'} src={logo} alt="" />
            <span className="stage-index">FIG 01 / RESTUP SIGNAL</span>
          </div>
        </div>
        <section className="chapter intro" id="debut">
          <div className="copy">
            <p className="eyebrow"><i /> 01 / LE CHAOS</p>
            <h1>Qui pilote votre <em>rentabilité&nbsp;?</em></h1>
            <p className="lede">Commandes, coûts, équipes. Au milieu du service, l’essentiel peut vite se perdre.</p>
            <a className="cta" href="#maitrise">Explorer <span aria-hidden="true">↓</span></a>
          </div>
          <p className="chapter-footer"><span>01 — 04</span><span>FAITES DÉFILER ↓</span></p>
        </section>
        <section className="chapter" id="maitrise">
          <div className="copy" data-reveal>
            <p className="eyebrow"><i /> 02 / LA MAÎTRISE</p>
            <h2>Reprenez <em>les commandes.</em></h2>
            <p className="lede">Rassemblez vos données et repérez les décisions qui comptent pour votre restaurant.</p>
          </div>
        </section>
        <section className="chapter" id="pilotage">
          <div className="copy" data-reveal>
            <p className="eyebrow"><i /> 03 / LE PILOTAGE</p>
            <h2>Les chiffres <em>utiles.</em></h2>
            <p className="demo">SCÉNARIO FICTIF · MOIS DE DÉMONSTRATION</p>
            <dl className="metrics">{metrics.map(([name, value, detail]) =>
              <div key={name}><dt>{name}</dt><dd>{value}</dd><dd className="detail">{detail}</dd></div>)}</dl>
          </div>
        </section>
        <section className="chapter" id="croissance">
          <div className="copy" data-reveal>
            <p className="eyebrow"><i /> 04 / LA CROISSANCE</p>
            <h2>Grandissez <em>sur vos bases.</em></h2>
            <ul className="pillars">{['Rentabilité', 'Opérations', 'Management', 'Développement'].map((label) => <li key={label}>{label}</li>)}</ul>
            <a className="cta" href="/diagnostic">Demander un diagnostic <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </div>
    </main>
    <footer className="bar bottom"><span className="brand">RESTUP<span className="brand-dot">.</span></span><span>PROTOTYPE INTERACTIF</span></footer>
  </>;
}

createRoot(document.querySelector('#root')).render(<App />);

