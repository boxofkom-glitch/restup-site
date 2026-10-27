// Cockpit « Aujourd'hui » : ce que le coach doit faire maintenant, sans rien chercher.
(function () {
  const esc = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 86400000;
  const waPhone = (p) => { let d = String(p || '').replace(/[^\d+]/g, ''); if (d.startsWith('+')) return d.slice(1); if (d.startsWith('00')) return d.slice(2); if (d.startsWith('0')) return '33' + d.slice(1); return d; };
  const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };

  const CSS = `
  .td-wrap{margin-bottom:34px;}
  .td-head{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-bottom:16px;}
  .td-head h1{font-size:clamp(22px,3vw,30px);}
  .td-head p{font-size:14px;color:var(--muted,#B7BDB4);margin-top:4px;}
  .td-count{font-size:13px;font-weight:700;color:#B37BFF;background:rgba(155,77,255,.16);padding:6px 12px;border-radius:999px;}
  .td-list{display:flex;flex-direction:column;gap:10px;}
  .td-item{display:flex;align-items:center;gap:14px;background:var(--surface,#151515);border:1px solid var(--line,#2B2E2A);border-left:3px solid #9B4DFF;border-radius:14px;padding:14px 16px;}
  .td-item.hot{border-left-color:#ff6b6b;}
  .td-main{flex:1;min-width:0;}
  .td-main b{display:block;font-size:14.5px;}
  .td-main span{display:block;font-size:12.8px;color:var(--muted,#B7BDB4);margin-top:3px;line-height:1.4;}
  .td-kind{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#B37BFF;margin-bottom:3px;}
  .td-item.hot .td-kind{color:#ff8a8a;}
  .td-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
  .td-btn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 15px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;border:1px solid var(--line,#2B2E2A);color:#fff;background:transparent;white-space:nowrap;}
  .td-btn.p{background:#fff;color:#6d2fd0;border-color:#fff;}
  .td-empty{padding:26px;border:1px dashed var(--line,#2B2E2A);border-radius:14px;color:var(--muted,#B7BDB4);text-align:center;font-size:14px;}
  @media (max-width:640px){.td-item{flex-direction:column;align-items:stretch;gap:10px}.td-actions{justify-content:stretch}.td-btn{flex:1}}
  `;

  async function run() {
    const host = document.getElementById('todayRoot');
    if (!host || typeof supabaseClient === 'undefined') return;
    const me = await restupRequireStaff();
    if (!me) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    host.innerHTML = '<div class="td-wrap"><div class="td-head"><div><h1>Aujourd\'hui</h1><p>Ce qui demande ton attention maintenant.</p></div></div><div class="td-empty">Chargement…</div></div>';

    const q = (p) => p.then((r) => r.data || []).catch(() => []);
    const [profiles, audits, plans, reports, invites, events] = await Promise.all([
      q(supabaseClient.from('profiles').select('id, company_name, first_name, phone, email, access_granted, onboarding_status, audit_scheduled_at, created_at')),
      q(supabaseClient.from('audits').select('user_id, data')),
      q(supabaseClient.from('plans').select('user_id, data')),
      q(supabaseClient.from('call_reports').select('client_id, created_at, kind')),
      q(supabaseClient.from('client_invitations').select('id, email, first_name, company_name, status, last_sent_at, created_at').eq('status', 'invited')),
      q(supabaseClient.from('events').select('client_id, created_at').order('created_at', { ascending: false }).limit(500)),
    ]);
    const now = Date.now();
    const clients = profiles.filter((p) => p.access_granted);
    const auditBy = Object.fromEntries(audits.map((a) => [a.user_id, a.data || {}]));
    const planBy = Object.fromEntries(plans.map((a) => [a.user_id, a.data || {}]));
    const lastReport = {}; reports.forEach((r) => { if (!lastReport[r.client_id] || r.created_at > lastReport[r.client_id]) lastReport[r.client_id] = r.created_at; });
    const lastEvent = {}; events.forEach((e) => { if (e.client_id && (!lastEvent[e.client_id] || e.created_at > lastEvent[e.client_id])) lastEvent[e.client_id] = e.created_at; });
    const name = (c) => c.company_name || c.first_name || c.email || 'Client';
    const link = (c, tab) => 'client.html?id=' + encodeURIComponent(c.id) + (tab ? '&tab=' + tab : '');
    const wa = (c, msg) => { const ph = waPhone(c.phone); return ph ? 'https://wa.me/' + ph + (msg ? '?text=' + encodeURIComponent(msg) : '') : ''; };
    const items = [];
    const add = (o) => items.push(o);

    clients.forEach((c) => {
      const a = auditBy[c.id], p = planBy[c.id];
      const done = /complet|done|termin/i.test(c.onboarding_status || '');
      const at = c.audit_scheduled_at ? new Date(c.audit_scheduled_at).getTime() : null;

      if (at && at >= now - 2 * 3600000 && at <= now + 2 * DAY)
        add({ pr: 0, hot: true, kind: 'Call à venir', title: name(c), why: fmt(c.audit_scheduled_at) + ' · prépare ton brief', btn: [['Ouvrir le brief', link(c, 'copilot'), true]] });
      if (at && at < now - 2 * 3600000 && !(lastReport[c.id] && lastReport[c.id] > c.audit_scheduled_at))
        add({ pr: 1, hot: true, kind: 'Compte rendu manquant', title: name(c), why: 'Call du ' + fmt(c.audit_scheduled_at) + ' sans compte rendu', btn: [['Faire le compte rendu', link(c, 'copilot'), true]] });
      if (!at && done && !a)
        add({ pr: 2, kind: 'Audit à programmer', title: name(c), why: 'Questionnaire terminé, aucun rendez-vous planifié', btn: [['Planifier', link(c), true], ...(wa(c) ? [['WhatsApp', wa(c, 'Bonjour ' + (c.first_name || '') + ', on planifie ton audit ? Quels créneaux te conviennent ?'), false]] : [])] });
      if (a && a.status === 'draft')
        add({ pr: 3, kind: 'Audit à valider', title: name(c), why: 'Brouillon prêt : relis, corrige, choisis la première priorité, puis publie', btn: [['Relire l\'audit', link(c, 'audit'), true]] });
      if (a && a.status === 'published' && (!p || p.status === 'draft'))
        add({ pr: 4, kind: 'Plan à publier', title: name(c), why: p ? 'Plan en brouillon' : 'Audit publié, plan pas encore créé', btn: [['Ouvrir le plan', link(c, 'plan'), true]] });
      if (!done && c.created_at && now - new Date(c.created_at).getTime() > 2 * DAY)
        add({ pr: 5, kind: 'Questionnaire en attente', title: name(c), why: 'Compte activé depuis plus de 2 jours, questionnaire non terminé', btn: [...(wa(c) ? [['Relancer sur WhatsApp', wa(c, 'Bonjour ' + (c.first_name || '') + ', as-tu pu remplir le questionnaire RestUp ? Il te prend 5 minutes et prépare notre audit.'), true]] : []), ['Dossier', link(c), false]] });
      const seen = [lastReport[c.id], lastEvent[c.id], c.created_at].filter(Boolean).sort().pop();
      if (seen && done && now - new Date(seen).getTime() > 14 * DAY)
        add({ pr: 6, kind: 'À relancer', title: name(c), why: 'Aucune activité depuis ' + Math.floor((now - new Date(seen).getTime()) / DAY) + ' jours', btn: [...(wa(c) ? [['Prendre des nouvelles', wa(c, 'Bonjour ' + (c.first_name || '') + ', comment ça se passe de ton côté cette semaine ?'), true]] : []), ['Dossier', link(c), false]] });
    });
    invites.forEach((i) => {
      const since = new Date(i.last_sent_at || i.created_at).getTime();
      if (now - since > 3 * DAY)
        add({ pr: 7, kind: 'Invitation sans réponse', title: i.company_name || i.first_name || i.email, why: 'Envoyée il y a ' + Math.floor((now - since) / DAY) + ' jours, pas encore activée', btn: [['Renvoyer', 'index.html', true]] });
    });

    items.sort((x, y) => x.pr - y.pr);
    const list = items.length
      ? '<div class="td-list">' + items.map((it) => `<div class="td-item${it.hot ? ' hot' : ''}"><div class="td-main"><div class="td-kind">${esc(it.kind)}</div><b>${esc(it.title)}</b><span>${esc(it.why)}</span></div><div class="td-actions">${it.btn.map(([l, h, pr]) => `<a class="td-btn${pr ? ' p' : ''}" href="${esc(h)}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ''}>${esc(l)}</a>`).join('')}</div></div>`).join('') + '</div>'
      : '<div class="td-empty">Rien d\'urgent : tous tes clients sont à jour.</div>';
    host.innerHTML = `<div class="td-wrap"><div class="td-head"><div><h1>Aujourd'hui</h1><p>Ce qui demande ton attention maintenant.</p></div><span class="td-count">${items.length} action${items.length > 1 ? 's' : ''}</span></div>${list}</div>`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
