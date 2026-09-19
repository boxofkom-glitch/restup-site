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
const IS_LOCAL = (location.hostname === "localhost" || location.hostname === "127.0.0.1");

// 'admin' (développeur) | 'coach' | 'client'
async function restupRole(user) {
  if (!user) return null;
  if ((user.email || "").toLowerCase() === DEV_EMAIL) return "admin";
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
