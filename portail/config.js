// ============================================================
// CONFIGURATION OPTIONNELLE — voir README.md, section "Aller plus loin"
// Ces deux clés ne sont pas obligatoires : sans elles, le site
// fonctionne quand même (le champ établissement reste un simple
// texte libre, et la prise de rendez-vous devient un formulaire
// de demande au lieu d'un calendrier automatique).
// ============================================================

// 1. Google Maps — pour l'auto-complétion d'adresse d'établissement à l'inscription.
//    Clé "Places API" : https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "REMPLACEZ_PAR_VOTRE_CLE_GOOGLE_MAPS";

// 2. Cal.com — pour que le client réserve un call directement synchronisé
//    avec VOTRE Google Agenda et le sien. Compte gratuit sur https://cal.com,
//    connectez votre Google Agenda, puis collez ici le lien de votre
//    type d'événement (ex: "https://cal.com/votre-nom/audit-30min").
const CALCOM_BOOKING_URL = "REMPLACEZ_PAR_VOTRE_LIEN_CALCOM";
