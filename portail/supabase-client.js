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
