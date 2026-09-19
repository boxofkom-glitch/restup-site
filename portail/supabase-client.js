// ============================================================
// CONFIGURATION — à remplir une seule fois (voir README.md)
// ============================================================
// 1. Créez un compte gratuit sur https://supabase.com
// 2. Créez un projet (nom libre, ex: "restup")
// 3. Dans le menu "Project Settings" > "API", copiez :
//    - "Project URL"        -> collez-le dans SUPABASE_URL ci-dessous
//    - "anon public" key    -> collez-le dans SUPABASE_ANON_KEY ci-dessous
// ============================================================

const SUPABASE_URL = "https://etsxerdfshbkmqzfzzbi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ulclSqYXAZvDITZzx8RC7A_DpwSjY27";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Domaine de production utilisé pour tous les liens envoyés par email (invitations,
// mot de passe oublié). Toujours ce domaine, même si l'admin déclenche l'envoi
// depuis un serveur de test local — sinon le lien reçu par le destinataire mène
// vers un localhost qui n'existe plus pour lui.
const PROD_ORIGIN = "https://restup.solutions";

// ---- Auth partagée : le rôle vient du compte (jamais d'un choix de l'utilisateur) ----
const DEV_EMAIL = "box.of.kom@gmail.com";
// Développeurs / gérants RestUp (accès complet : clients, coachs, facturation). Doit rester aligné avec is_dev() en base.
const DEV_EMAILS = ["box.of.kom@gmail.com", "antoinebarat1@gmail.com"];
function restupIsDev(email) { return DEV_EMAILS.indexOf(String(email || "").toLowerCase()) !== -1; }
const IS_LOCAL = (location.hostname === "localhost" || location.hostname === "127.0.0.1");

// 'admin' (développeur) | 'coach' | 'client'
async function restupRole(user) {
  if (!user) return null;
  if (restupIsDev(user.email)) return "admin";
  try {
    const { data: a } = await supabaseClient.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (a) return "coach";
    const { data: t } = await supabaseClient.from("team_members").select("id").eq("user_id", user.id).eq("role", "coach").maybeSingle();
    if (t) return "coach";
  } catch (e) { /* on retombe sur client : le moins privilégié */ }
  return "client";
}

// Pages équipe (coach/admin). Redirige sinon. En local uniquement, un utilisateur "aperçu" est toléré.
async function restupRequireStaff() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    if (IS_LOCAL) return { id: "preview", email: DEV_EMAIL };
    window.location.href = "/portail/login.html";
    return null;
  }
  const role = await restupRole(data.session.user);
  if (role === "client") { window.location.href = "/portail/dashboard.html"; return null; }
  return data.session.user;
}

// ---- Barre du haut (équipe) : avatar / photo du coach + déconnexion ----
async function restupStaffBar(me) {
  if (!me || document.getElementById("staffBar")) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let prof = null;
  try { const { data } = await supabaseClient.from("staff_profiles").select("display_name, photo_url").eq("user_id", me.id).maybeSingle(); prof = data; } catch (e) {}
  const isDev = restupIsDev(me.email);
  const name = (prof && prof.display_name) || (me.email || "coach").split("@")[0];
  const initials = name.trim().slice(0, 2).toUpperCase();
  const avatar = prof && prof.photo_url
    ? `<img class="sb-av" src="${esc(prof.photo_url)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'sb-av',textContent:'${esc(initials)}'}))">`
    : `<span class="sb-av">${esc(initials)}</span>`;

  const style = document.createElement("style");
  style.textContent = `
    #staffBar{position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:flex-end;gap:14px;padding:10px 24px;background:rgba(11,13,12,.86);backdrop-filter:blur(12px);border-bottom:1px solid var(--line,#2B2E2A);}
    #staffBar a.sb-user{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;min-width:0;}
    #staffBar .sb-av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#9B4DFF,#B37BFF);color:#fff;font-weight:900;font-size:13px;border:2px solid rgba(255,255,255,.12);}
    #staffBar .sb-txt{display:flex;flex-direction:column;line-height:1.15;min-width:0;}
    #staffBar .sb-txt b{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}
    #staffBar .sb-txt small{font-size:11px;color:var(--muted-dim,#82887F);}
    #staffBar .sb-out{background:transparent;border:1px solid var(--line,#2B2E2A);color:var(--muted,#B7BDB4);font-family:inherit;font-weight:700;font-size:12.5px;padding:8px 14px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
    #staffBar .sb-out:hover{color:#fff;border-color:#9B4DFF;}
    #logoutBtn,#sidebarLogoutBtn,.side-foot .icon-btn{display:none !important;}
    @media (max-width:900px){#staffBar{padding:8px 14px;}#staffBar .sb-txt{display:none;}}
  `;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.id = "staffBar";
  bar.innerHTML = `<a class="sb-user" href="${location.pathname.includes('/admin/') ? 'settings.html' : 'admin/settings.html'}" title="Mon profil">${avatar}<span class="sb-txt"><b>${esc(name)}</b><small>${isDev ? "Développeur" : "Coach"}</small></span></a>
    <button type="button" class="sb-out" id="staffLogout"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>Déconnexion</button>`;
  const host = document.querySelector(".main") || document.body;
  host.insertBefore(bar, host.firstChild);

  // Navigation basse (mobile) : 4 destinations + « Plus » qui ouvre le menu complet.
  const inAdmin = location.pathname.includes("/admin/");
  const base = inAdmin ? "" : "admin/";
  const here = location.pathname.split("/").pop();
  const ico = (d) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const items = [
    ["index.html", "Clients", ico('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>')],
    ["suivi.html", "Aujourd'hui", ico('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')],
    ["agenda.html", "Agenda", ico('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')],
    ["messages.html", "Messages", ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>')],
  ];
  const nav = document.createElement("nav");
  nav.id = "staffBottomNav";
  nav.innerHTML = items.map(([h, l, i]) => `<a href="${base + h}" class="${here === h ? "on" : ""}">${i}<span>${l}</span></a>`).join("")
    + `<button type="button" id="bnMore">${ico('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')}<span>Plus</span></button>`;
  document.body.appendChild(nav);
  const bs = document.createElement("style");
  bs.textContent = `#staffBottomNav{display:none;}
    @media (max-width:900px){
      #staffBottomNav{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;background:rgba(11,13,12,.94);backdrop-filter:blur(14px);border-top:1px solid var(--line,#2B2E2A);padding:6px 6px calc(6px + env(safe-area-inset-bottom));}
      #staffBottomNav a,#staffBottomNav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;color:#9aa09a;text-decoration:none;background:none;border:0;font-size:10.5px;font-weight:700;line-height:1.1;font-family:inherit;cursor:pointer;border-radius:12px;}
      #staffBottomNav a.on{color:#fff;background:rgba(155,77,255,.22);}
      #staffBottomNav a.on svg{color:#B37BFF;}
      body{padding-bottom:76px;}
    }`;
  document.head.appendChild(bs);
  document.getElementById("bnMore").addEventListener("click", () => { const t = document.getElementById("mobileNavToggle"); if (t) t.click(); });
  document.getElementById("staffLogout").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "/portail/login.html";
  });
}

// ---- Invitation client (flux unique, dédoublonné, renvoyable) ----
// Crée/relance l'invitation puis envoie l'email brandé. Aucun rôle n'est choisi par le client.
async function restupInviteClient(f) {
  const email = (f.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Adresse email invalide." };

  const { data: existing, error: selErr } = await supabaseClient
    .from("client_invitations").select("*").ilike("email", email).in("status", ["invited", "accepted"]).maybeSingle();
  if (selErr) return { error: selErr.message };
  if (existing && existing.status === "accepted") return { error: "Ce client a déjà activé son accès.", duplicate: true };

  let inv = existing, created = false;
  if (!inv) {
    const { data, error } = await supabaseClient.from("client_invitations").insert({
      email, first_name: f.first_name || null, last_name: f.last_name || null, phone: f.phone || null,
      company_name: f.company_name || null, coach_id: f.coach_id || null,
    }).select().single();
    if (error) return { error: /duplicate|unique/i.test(error.message) ? "Une invitation existe déjà pour cet email." : error.message };
    inv = data; created = true;
  }

  const { error: otpErr } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: PROD_ORIGIN + "/portail/set-password.html", data: { company_name: f.company_name || "" } },
  });
  if (otpErr) {
    if (created) await supabaseClient.from("client_invitations").delete().eq("id", inv.id);
    return { error: /rate|seconds|too many/i.test(otpErr.message) ? "Trop d'envois rapprochés : réessaie dans une minute." : "Envoi impossible : " + otpErr.message };
  }
  if (!created) {
    await supabaseClient.from("client_invitations").update({ last_sent_at: new Date().toISOString(), send_count: (inv.send_count || 1) + 1 }).eq("id", inv.id);
  }
  return { ok: true, resent: !created, invitation: inv };
}

// Page client : session obligatoire ; l'équipe est renvoyée vers son cockpit.
async function restupRequireClient() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    if (IS_LOCAL) return { id: "mock-1", email: "apercu@restup.fr", user_metadata: {}, _preview: true };
    window.location.href = "/portail/login.html";
    return null;
  }
  const role = await restupRole(data.session.user);
  if (role !== "client" && !new URLSearchParams(location.search).has("preview")) {
    window.location.href = "/portail/admin/index.html";
    return null;
  }
  return data.session.user;
}

// ---- Appli installée (écran d'accueil) : plein écran, jamais d'interface de navigateur ----
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("/portail/sw.js", { scope: "/portail/" }).catch(() => {});
}
(function () {
  const standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  if (!standalone) return;
  document.documentElement.classList.add("is-app");
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a[href]").forEach((a) => {
      let p; try { p = new URL(a.href, location.href).pathname; } catch (e) { return; }
      if (p.indexOf("/portail/") === 0) return;
      // Un lien vers le site public ferait apparaître la barre du navigateur : le logo ramène à l'accueil de l'appli, le reste est masqué.
      if (a.classList.contains("wordmark")) a.href = "/portail/login.html"; else a.style.display = "none";
    });
  });
})();

// ---- Bouton menu mobile : bien visible (violet plein + libellé), sur toutes les pages ----
(function () {
  const s = document.createElement("style");
  s.textContent = `.mobile-nav-toggle{width:auto !important;height:44px !important;padding:0 16px 0 14px !important;gap:8px;border-radius:999px !important;border:0 !important;color:#fff !important;background:linear-gradient(135deg,#9B4DFF,#6d2fd0) !important;box-shadow:0 4px 16px rgba(155,77,255,.45);font-weight:800;font-size:13px;letter-spacing:.3px;}
  .mobile-nav-toggle::after{content:"Menu";font-family:inherit;font-weight:800;font-size:13px;}
  .mobile-nav-toggle svg{width:22px !important;height:22px !important;stroke-width:2.6 !important;}
  .mobile-nav-toggle:active{transform:scale(.96);}`;
  document.head.appendChild(s);
})();
