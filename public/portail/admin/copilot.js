// Copilote coach : brief avant call · compte rendu après call (extraction proposée, validée par le coach) · récap WhatsApp · engagements.
// Règle : l'outil propose, le coach corrige et valide. Rien n'est envoyé au client sans clic du coach.
(function () {
  const CSS = `
  .cp-card{background:var(--surface,#151515);border:1px solid var(--line,#2B2E2A);border-radius:16px;padding:18px;margin-bottom:16px;}
  .cp-card h3{font-size:16px;margin-bottom:4px;}
  .cp-sub{font-size:12.5px;color:var(--muted-dim,#82887F);margin-bottom:12px;}
  .cp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;}
  .cp-box{background:var(--surface-2,#1b1b1b);border:1px solid var(--line,#2B2E2A);border-radius:12px;padding:12px 14px;}
  .cp-box h4{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:#B37BFF;margin-bottom:8px;}
  .cp-box ul{list-style:none;display:flex;flex-direction:column;gap:6px;font-size:13.5px;line-height:1.45;}
  .cp-box li::before{content:"–";color:#B37BFF;margin-right:8px;}
  .cp-empty{color:var(--muted-dim,#82887F);font-size:13px;}
  .cp-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px;}
  .cp-card textarea,.cp-card select{width:100%;background:var(--surface-2,#1b1b1b);border:1px solid var(--line,#2B2E2A);border-radius:10px;padding:11px 13px;color:#fff;font-family:inherit;font-size:14px;line-height:1.5;}
  .cp-card textarea{min-height:84px;resize:vertical;}
  .cp-card label{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#B7BDB4);margin:12px 0 6px;}
  .cp-hist{border-top:1px solid var(--line,#2B2E2A);padding:14px 0;}
  .cp-hist:first-child{border-top:0;}
  .cp-tag{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(155,77,255,.18);color:#B37BFF;margin-left:8px;}
  .cp-check{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;margin-top:6px;cursor:pointer;}
  .cp-check input{margin-top:3px;accent-color:#9B4DFF;}
  .cp-check.done span{text-decoration:line-through;color:var(--muted-dim,#82887F);}
  `;

  const lines = (s) => String(s || '').split('\n').map((x) => x.replace(/^[\s\-•*–·\d.)]+/, '').trim()).filter(Boolean);
  const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const waPhone = (p) => { let d = String(p || '').replace(/[^\d+]/g, ''); if (d.startsWith('+')) return d.slice(1); if (d.startsWith('00')) return d.slice(2); if (d.startsWith('0')) return '33' + d.slice(1); return d; };

  // ---- Extraction proposée (règles simples, toujours corrigée par le coach) ----
  function extract(notes) {
    const raw = String(notes || '').replace(/\r/g, '');
    const sentences = raw.split(/\n+|(?<=[.!?])\s+/).map((s) => s.replace(/^[\s\-•*–·]+/, '').trim()).filter((s) => s.length > 6);
    const out = { summary: '', decisions: [], commitments: [], tasks: [], risks: [], questions: [] };
    const rx = {
      decision: /\b(décid|on part sur|on garde|on valide|validé|choisi|retenu|priorité|on arrête|on lance)/i,
      coach: /\b(je (vais|t['’]envoie|te|reviens|prépare|regarde|fais|m['’]occupe)|de mon côté|côté coach|je vous|on t['’]envoie)/i,
      client: /\b(tu (vas|dois|devras|peux|fais)|vous (allez|devez)|le client|il (va|doit)|elle (va|doit)|à faire|à envoyer|à vérifier|à relever|d['’]ici|avant (le|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|la fin)|pour (lundi|mardi|mercredi|jeudi|vendredi|demain|la semaine))/i,
      risk: /\b(risque|problème|blocage|bloqué|retard|impayé|tréso|difficile|inquiet|tension|conflit|départ|démission|urgent)/i,
      question: /\?|\b(à voir|à confirmer|en attente|pas sûr|on verra|reste à savoir|sans réponse)/i,
    };
    sentences.forEach((s) => {
      if (rx.question.test(s)) out.questions.push(s.replace(/\s*\?+\s*$/, '').trim() + (s.includes('?') ? ' ?' : ''));
      else if (rx.coach.test(s)) out.commitments.push(s);
      else if (rx.client.test(s)) out.tasks.push(s);
      else if (rx.decision.test(s)) out.decisions.push(s);
      else if (rx.risk.test(s)) out.risks.push(s);
      if (rx.risk.test(s) && !out.risks.includes(s) && !rx.question.test(s)) out.risks.push(s);
    });
    out.summary = sentences.slice(0, 3).join(' ').slice(0, 480);
    return out;
  }

  function buildRecap(firstName, d, nextDate) {
    const L = [];
    L.push('Bonjour' + (firstName ? ' ' + firstName : '') + ',');
    L.push('Merci pour notre échange. Voici l\'essentiel :');
    if (d.decisions.length) L.push('', 'Ce qu\'on a décidé :', ...d.decisions.map((x) => '• ' + x));
    if (d.tasks.length) L.push('', 'Tes actions :', ...d.tasks.map((x) => '• ' + x));
    if (d.commitments.length) L.push('', 'Mes engagements :', ...d.commitments.map((x) => '• ' + x));
    if (nextDate) L.push('', 'Prochain rendez-vous : ' + nextDate);
    L.push('', 'Je reste disponible ici si besoin.');
    return L.join('\n');
  }

  window.restupCopilot = async function (ctx) {
    const { sb, clientId, profile, me, root, esc, toast, logEvent, isUuid } = ctx;
    if (!document.getElementById('cpStyle')) { const st = document.createElement('style'); st.id = 'cpStyle'; st.textContent = CSS; document.head.appendChild(st); }
    const real = isUuid(clientId);
    const firstName = profile?.first_name || (profile?.company_name || '').split(' ')[0] || '';
    const say = (m, t) => { if (toast) toast(m, t || 'ok'); };
    let reports = [];

    async function load() {
      if (!real) { reports = []; return; }
      const { data } = await sb.from('call_reports').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(15);
      reports = data || [];
    }

    // ---------------- BRIEF ----------------
    async function briefData() {
      const b = { goal: [], last: null, open: [], changed: [], questions: [], plan: null };
      let audit = null, plan = null, events = [];
      try { const { data } = await sb.from('audits').select('data').eq('user_id', clientId).maybeSingle(); audit = data && data.data; } catch (e) {}
      try { const { data } = await sb.from('plans').select('data').eq('user_id', clientId).maybeSingle(); plan = data && data.data; } catch (e) {}
      const last = reports[0] || null;
      const since = last ? last.created_at : (profile?.created_at || '1970-01-01');
      try { const { data } = await sb.from('events').select('type,created_at').eq('client_id', clientId).gt('created_at', since).order('created_at', { ascending: false }).limit(40); events = data || []; } catch (e) {}

      if (audit?.quick_win?.action) b.goal.push('Première priorité : ' + audit.quick_win.action + (audit.quick_win.result ? ' — résultat : ' + audit.quick_win.result : ''));
      if (audit?.growth_journey?.objective_4m) b.goal.push('Objectif à 4 mois : ' + audit.growth_journey.objective_4m);
      if (audit?.growth_journey?.blocker) b.goal.push('Blocage identifié : ' + audit.growth_journey.blocker);
      const ans = profile?.onboarding?.answers || {};
      Object.entries(ans).filter(([, v]) => typeof v === 'string' && v.length > 2).slice(0, 3).forEach(([k, v]) => b.goal.push(k.replace(/_/g, ' ') + ' : ' + v));
      if (!b.goal.length) b.goal.push('Aucun objectif renseigné : à clarifier en début de call.');

      if (last) b.last = { at: last.created_at, summary: last.summary || '(pas de résumé)' };
      reports.forEach((r) => (r.commitments || []).forEach((c, i) => { if (!c.done) b.open.push({ text: c.text || c, who: 'Toi' }); }));
      const tasks = [];
      if (plan) {
        const push = (t, where) => tasks.push({ t, where });
        (plan.priorities_4m?.items || []).forEach((t) => push(t, 'Priorités'));
        (plan.cycles || []).forEach((cy) => (cy.months || []).forEach((m) => (m.weeks || []).forEach((w) => { if (!w.locked) (w.tasks || []).forEach((t) => push(t, w.label || m.name || '')); })));
        const open = tasks.filter((x) => !x.t.done);
        open.slice(0, 5).forEach((x) => b.open.push({ text: x.t.text, who: 'Client' }));
        const doneSince = tasks.filter((x) => x.t.done && x.t.done_at && x.t.done_at > since);
        doneSince.forEach((x) => b.changed.push('Tâche faite : ' + x.t.text));
        b.plan = { done: tasks.filter((x) => x.t.done).length, total: tasks.length, status: plan.status === 'draft' ? 'brouillon' : 'publié' };
      }
      const labels = { 'onboarding.completed': 'Questionnaire terminé', 'audit.published': 'Audit publié', 'plan.reset': 'Plan réinitialisé', 'audit.reset': 'Audit réinitialisé', 'account.claimed': 'Compte activé' };
      events.forEach((e) => { if (labels[e.type]) b.changed.push(labels[e.type] + ' (' + fmtDate(e.created_at) + ')'); });
      if (!b.changed.length) b.changed.push(last ? 'Rien de nouveau enregistré depuis le dernier compte rendu.' : 'Premier échange : pas d\'historique.');

      (last?.questions || []).forEach((q) => b.questions.push('Point resté ouvert : ' + q));
      if (audit?.quick_win?.action) b.questions.push('Où en est « ' + audit.quick_win.action + ' » ? Qu\'est-ce qui a changé concrètement ?');
      b.questions.push('Qu\'est-ce qui t\'a pris le plus de temps ou d\'énergie cette semaine ?');
      b.questions.push('Quelle décision restes-tu en train de repousser ?');
      return b;
    }

    function ul(items, empty) { return items.length ? '<ul>' + items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<div class="cp-empty">' + esc(empty) + '</div>'; }

    async function renderBrief(host) {
      host.innerHTML = '<div class="cp-empty">Préparation du brief…</div>';
      const b = await briefData();
      const nextAt = profile?.audit_scheduled_at ? new Date(profile.audit_scheduled_at) : null;
      host.innerHTML = `
        <h3>Brief avant call</h3>
        <div class="cp-sub">Généré à partir du dossier · ${nextAt && !isNaN(nextAt) ? 'prochain rendez-vous : ' + esc(nextAt.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })) : 'aucun rendez-vous planifié'}${b.plan ? ' · plan ' + b.plan.status + ' : ' + b.plan.done + '/' + b.plan.total + ' tâches faites' : ''}</div>
        <div class="cp-grid">
          <div class="cp-box"><h4>Objectif &amp; situation</h4>${ul(b.goal, '—')}</div>
          <div class="cp-box"><h4>Dernier compte rendu</h4>${b.last ? '<div style="font-size:13.5px;line-height:1.5;"><b>' + esc(fmtDate(b.last.at)) + '</b><br>' + esc(b.last.summary) + '</div>' : '<div class="cp-empty">Aucun compte rendu pour l\'instant.</div>'}</div>
          <div class="cp-box"><h4>Ce qui a changé</h4>${ul(b.changed, '—')}</div>
          <div class="cp-box"><h4>Engagements ouverts</h4>${b.open.length ? '<ul>' + b.open.slice(0, 8).map((o) => '<li><b>' + esc(o.who) + '</b> · ' + esc(o.text) + '</li>').join('') + '</ul>' : '<div class="cp-empty">Aucun engagement ouvert.</div>'}</div>
          <div class="cp-box"><h4>Questions suggérées</h4>${ul(b.questions, '—')}</div>
        </div>
        <div class="cp-row"><button type="button" class="btn-secondary" id="cpCopyBrief" style="padding:9px 16px;">Copier le brief</button></div>`;
      host.querySelector('#cpCopyBrief').addEventListener('click', async () => {
        const txt = ['BRIEF — ' + (profile?.company_name || ''), '', 'OBJECTIF', ...b.goal, '', 'DERNIER CR', b.last ? b.last.summary : '—', '', 'CE QUI A CHANGÉ', ...b.changed, '', 'ENGAGEMENTS OUVERTS', ...b.open.map((o) => o.who + ' : ' + o.text), '', 'QUESTIONS', ...b.questions].join('\n');
        try { await navigator.clipboard.writeText(txt); say('Brief copié'); } catch (e) { say('Copie impossible', 'error'); }
      });
    }

    // ---------------- COMPTE RENDU ----------------
    function renderForm(host, state) {
      const st = state || { step: 1, kind: 'suivi', notes: '' };
      if (st.step === 1) {
        host.innerHTML = `
          <h3>Compte rendu après call</h3>
          <div class="cp-sub">Colle tes notes ou la transcription : le copilote propose le résumé, les décisions, les actions et les engagements. Tu corriges, puis tu valides.</div>
          <label>Type d'échange</label>
          <select id="cpKind"><option value="suivi">Call de suivi</option><option value="audit">Audit</option><option value="autre">Autre</option></select>
          <label>Notes / transcription</label>
          <textarea id="cpNotes" style="min-height:150px;" placeholder="Ex. On a décidé de relever les pertes cuisine pendant 7 jours. Tu vas envoyer les fiches d'achats avant vendredi. Je t'envoie le modèle de fiche demain. Risque : trésorerie tendue en fin de mois."></textarea>
          <div class="cp-row"><button type="button" class="btn-primary magnetic" id="cpExtract" style="padding:10px 20px;">Extraire les points clés</button></div>`;
        host.querySelector('#cpKind').value = st.kind;
        host.querySelector('#cpNotes').value = st.notes;
        host.querySelector('#cpExtract').addEventListener('click', () => {
          const notes = host.querySelector('#cpNotes').value.trim();
          if (notes.length < 12) { say('Ajoute quelques lignes de notes d\'abord', 'error'); return; }
          const d = extract(notes);
          const nextAt = profile?.audit_scheduled_at ? new Date(profile.audit_scheduled_at) : null;
          d.recap = buildRecap(firstName, d, nextAt && !isNaN(nextAt) && nextAt > new Date() ? nextAt.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : '');
          renderForm(host, { step: 2, kind: host.querySelector('#cpKind').value, notes, d });
        });
        return;
      }
      const d = st.d;
      host.innerHTML = `
        <h3>Compte rendu — à relire et valider</h3>
        <div class="cp-sub">Proposition automatique : corrige librement (une ligne = un point). Rien n'est envoyé au client tant que tu n'as pas cliqué.</div>
        <label>Résumé</label><textarea id="fSummary">${esc(d.summary)}</textarea>
        <label>Décisions</label><textarea id="fDecisions">${esc(d.decisions.join('\n'))}</textarea>
        <label>Actions du client</label><textarea id="fTasks">${esc(d.tasks.join('\n'))}</textarea>
        <label>Mes engagements (coach)</label><textarea id="fCommit">${esc(d.commitments.join('\n'))}</textarea>
        <label>Risques &amp; points d'attention</label><textarea id="fRisks">${esc(d.risks.join('\n'))}</textarea>
        <label>Questions restées ouvertes</label><textarea id="fQuestions">${esc(d.questions.join('\n'))}</textarea>
        <label>Récap WhatsApp (modifiable)</label><textarea id="fRecap" style="min-height:170px;">${esc(d.recap)}</textarea>
        <div class="cp-row">
          <button type="button" class="btn-secondary" id="cpRegen" style="padding:9px 16px;">Régénérer le récap</button>
          <button type="button" class="btn-secondary" id="cpBack" style="padding:9px 16px;">← Notes</button>
          <button type="button" class="btn-primary magnetic" id="cpSave" style="padding:10px 22px;">Valider et enregistrer</button>
        </div>`;
      const val = (id) => host.querySelector(id).value;
      const collect = () => ({ decisions: lines(val('#fDecisions')), tasks: lines(val('#fTasks')), commitments: lines(val('#fCommit')) });
      host.querySelector('#cpRegen').addEventListener('click', () => {
        host.querySelector('#fRecap').value = buildRecap(firstName, collect(), '');
        say('Récap régénéré');
      });
      host.querySelector('#cpBack').addEventListener('click', () => renderForm(host, { step: 1, kind: st.kind, notes: st.notes }));
      host.querySelector('#cpSave').addEventListener('click', async () => {
        if (!real) { say('Enregistrement réservé aux vrais clients (mode démo)', 'error'); return; }
        const btn = host.querySelector('#cpSave'); btn.disabled = true; btn.textContent = 'Enregistrement…';
        const c = collect();
        const row = {
          client_id: clientId, kind: st.kind, notes: st.notes, summary: val('#fSummary').trim(),
          decisions: c.decisions, tasks: c.tasks, commitments: c.commitments.map((t) => ({ text: t, done: false })),
          risks: lines(val('#fRisks')), questions: lines(val('#fQuestions')), recap: val('#fRecap').trim(),
          validated: true, validated_at: new Date().toISOString(),
        };
        const { error } = await sb.from('call_reports').insert(row);
        if (error) { btn.disabled = false; btn.textContent = 'Valider et enregistrer'; say('Enregistrement impossible : ' + error.message, 'error'); return; }
        await logEvent('call.report_validated', { kind: st.kind });
        say('Compte rendu validé');
        await refresh();
      });
    }

    // ---------------- HISTORIQUE ----------------
    function renderHistory(host) {
      if (!reports.length) { host.innerHTML = '<h3>Historique</h3><div class="cp-empty">Aucun compte rendu enregistré.</div>'; return; }
      host.innerHTML = '<h3>Historique des comptes rendus</h3>' + reports.map((r) => `
        <div class="cp-hist" data-id="${r.id}">
          <div><b>${esc(fmtDate(r.created_at))}</b><span class="cp-tag">${esc(r.kind)}</span>${r.validated ? '<span class="cp-tag">validé</span>' : '<span class="cp-tag">brouillon</span>'}${r.recap_sent_at ? '<span class="cp-tag">récap envoyé</span>' : ''}</div>
          <div style="font-size:13.5px;line-height:1.5;margin-top:6px;">${esc(r.summary || '')}</div>
          ${(r.commitments || []).map((c, i) => `<label class="cp-check${c.done ? ' done' : ''}" style="text-transform:none;letter-spacing:0;font-weight:500;color:inherit;margin:6px 0 0;"><input type="checkbox" data-c="${i}"${c.done ? ' checked' : ''}><span>Engagement : ${esc(c.text)}</span></label>`).join('')}
          <div class="cp-row">
            <button type="button" class="btn-secondary" data-wa="${r.id}" style="padding:8px 14px;font-size:13px;">Envoyer le récap par WhatsApp</button>
            <button type="button" class="btn-secondary" data-cp="${r.id}" style="padding:8px 14px;font-size:13px;">Copier le récap</button>
          </div>
        </div>`).join('');
      host.querySelectorAll('[data-c]').forEach((inp) => inp.addEventListener('change', async () => {
        const id = inp.closest('.cp-hist').dataset.id; const r = reports.find((x) => x.id === id); if (!r) return;
        const cm = (r.commitments || []).map((c, i) => (i === +inp.dataset.c ? { ...c, done: inp.checked } : c));
        const { error } = await sb.from('call_reports').update({ commitments: cm }).eq('id', id);
        if (error) { say('Mise à jour impossible', 'error'); inp.checked = !inp.checked; return; }
        r.commitments = cm; inp.closest('.cp-check').classList.toggle('done', inp.checked);
      }));
      host.querySelectorAll('[data-wa]').forEach((b) => b.addEventListener('click', async () => {
        const r = reports.find((x) => x.id === b.dataset.wa); if (!r) return;
        const phone = waPhone(profile?.phone);
        if (!phone) { say('Aucun numéro de téléphone pour ce client', 'error'); return; }
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(r.recap || ''), '_blank', 'noopener');
        await sb.from('call_reports').update({ recap_sent_at: new Date().toISOString() }).eq('id', r.id);
        await logEvent('whatsapp.recap_sent', { report: r.id });
        r.recap_sent_at = new Date().toISOString();
        say('WhatsApp ouvert — envoie le message depuis l\'appli');
      }));
      host.querySelectorAll('[data-cp]').forEach((b) => b.addEventListener('click', async () => {
        const r = reports.find((x) => x.id === b.dataset.cp); if (!r) return;
        try { await navigator.clipboard.writeText(r.recap || ''); say('Récap copié'); } catch (e) { say('Copie impossible', 'error'); }
      }));
    }

    async function refresh() {
      await load();
      root.innerHTML = '<div class="cp-card" id="cpBrief"></div><div class="cp-card" id="cpForm"></div><div class="cp-card" id="cpHist"></div>';
      renderBrief(root.querySelector('#cpBrief'));
      renderForm(root.querySelector('#cpForm'));
      renderHistory(root.querySelector('#cpHist'));
    }
    await refresh();
  };
})();
