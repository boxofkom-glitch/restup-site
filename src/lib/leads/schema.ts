// Contrat des formulaires Diagnostic et Contact, partagé par le navigateur et le serveur.
// Aucune donnée tarifaire ici : la liste des divisions et prestations autorisées est fournie à part.

export type FormType = 'diagnostic' | 'contact';

export const STAGES = ['En projet', 'En activité', 'Plusieurs établissements', 'Autre'] as const;
export const SITES = ['1', '2–5', '6+'] as const;
export const DEADLINES = ['Ce mois-ci', '1 à 3 mois', 'Plus tard', 'À préciser'] as const;
export const SUBJECTS = ['Question générale', 'Partenariat', 'Autre'] as const;
export const OFFERS = ['diagnostic', 'sprint', 'suivi'] as const;
export const HELP_ME = 'aidez-moi-a-choisir';

export const LIMITS = {
  name: 120,
  email: 254,
  establishment: 120,
  city: 100,
  phone: 30,
  messageMin: 20,
  messageMax: 1500,
} as const;

export const MESSAGES = {
  name: 'Renseignez votre nom',
  email: 'Saisissez une adresse e-mail valide',
  message: 'Décrivez votre besoin en au moins 20 caractères',
  messageMax: 'Votre message dépasse 1 500 caractères',
  stage: 'Choisissez le stade de votre projet',
  need: 'Choisissez votre besoin principal',
  subject: 'Choisissez le sujet de votre message',
  tooLong: 'Ce champ est trop long',
  invalid: 'Valeur non autorisée',
} as const;

export interface Allowlist {
  divisions: Array<{ slug: string; services: string[] }>;
}

export interface LeadInput {
  formType: FormType;
  name: string;
  email: string;
  message: string;
  stage?: string;
  need?: string;
  service?: string;
  offer?: string;
  subject?: string;
  establishment?: string;
  city?: string;
  phone?: string;
  sites?: string;
  deadline?: string;
  website?: string; // champ piège
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Supprime les caractères de contrôle et les espaces superflus. */
export const clean = (v: unknown) =>
  typeof v === 'string'
    ? v
        // eslint-disable-next-line no-control-regex -- suppression volontaire des caractères de contrôle
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim()
    : '';

/** Retourne les erreurs par champ (vide si tout est valide). */
export function validate(raw: Record<string, unknown>, allow: Allowlist): Record<string, string> {
  const v = Object.fromEntries(Object.entries(raw).map(([k, val]) => [k, clean(val)])) as Record<string, string>;
  const e: Record<string, string> = {};
  const formType = v.formType === 'contact' ? 'contact' : v.formType === 'diagnostic' ? 'diagnostic' : null;
  if (!formType) e.formType = MESSAGES.invalid;

  if (!v.name) e.name = MESSAGES.name;
  else if (v.name.length > LIMITS.name) e.name = MESSAGES.tooLong;

  if (!v.email || v.email.length > LIMITS.email || !EMAIL.test(v.email)) e.email = MESSAGES.email;

  if (v.message.length < LIMITS.messageMin) e.message = MESSAGES.message;
  else if (v.message.length > LIMITS.messageMax) e.message = MESSAGES.messageMax;

  for (const k of ['establishment', 'city', 'phone'] as const) {
    if (v[k] && v[k].length > LIMITS[k]) e[k] = MESSAGES.tooLong;
  }
  if (v.sites && !(SITES as readonly string[]).includes(v.sites)) e.sites = MESSAGES.invalid;
  if (v.deadline && !(DEADLINES as readonly string[]).includes(v.deadline)) e.deadline = MESSAGES.invalid;

  if (formType === 'diagnostic') {
    if (!v.stage) e.stage = MESSAGES.stage;
    else if (!(STAGES as readonly string[]).includes(v.stage)) e.stage = MESSAGES.invalid;

    const division = allow.divisions.find((d) => d.slug === v.need);
    if (!v.need) e.need = MESSAGES.need;
    else if (v.need !== HELP_ME && !division) e.need = MESSAGES.invalid;

    if (v.service && (!division || !division.services.includes(v.service))) e.service = MESSAGES.invalid;
    if (v.offer && !(OFFERS as readonly string[]).includes(v.offer)) e.offer = MESSAGES.invalid;
  }
  if (formType === 'contact') {
    if (!v.subject) e.subject = MESSAGES.subject;
    else if (!(SUBJECTS as readonly string[]).includes(v.subject)) e.subject = MESSAGES.invalid;
  }
  return e;
}

/** Ne garde que les champs du contrat, nettoyés. */
export function normalize(raw: Record<string, unknown>): LeadInput {
  const keys: Array<keyof LeadInput> = [
    'formType',
    'name',
    'email',
    'message',
    'stage',
    'need',
    'service',
    'offer',
    'subject',
    'establishment',
    'city',
    'phone',
    'sites',
    'deadline',
  ];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const val = clean(raw[k]);
    if (val) out[k] = k === 'email' ? val.toLowerCase() : val;
  }
  return out as unknown as LeadInput;
}
