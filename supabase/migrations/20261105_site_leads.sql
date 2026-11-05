-- Demandes du site public RESTUP (diagnostic et contact).
-- À appliquer seulement après validation par RESTUP de l'hébergement, des accès et des durées de conservation.
-- Le navigateur appelle uniquement la fonction submit_lead (rôle anon) : aucune lecture des tables côté public.

create table if not exists public.restup_lead_settings (
  id boolean primary key default true check (id),
  mode text not null default 'preview' check (mode in ('preview', 'production')),
  allowed_origins text[] not null default array['http://localhost:4321'],
  rate_max int not null default 5,
  rate_window interval not null default interval '10 minutes'
);
insert into public.restup_lead_settings (id, mode, allowed_origins)
values (true, 'production', array['https://restup.solutions', 'https://www.restup.solutions', 'http://localhost:4321'])
on conflict do nothing;

-- Liste blanche commune au formulaire : divisions (service null) et prestations publiées.
create table if not exists public.restup_lead_allowlist (
  division text not null,
  service text,
  published boolean not null default false,
  unique (division, service)
);
insert into public.restup_lead_allowlist (division, service, published) values
  ('rest-coaching', null, false),
  ('rest-coaching', 'rest-coaching-1', true),
  ('rest-coaching', 'rest-coaching-2', true),
  ('rest-coaching', 'rest-coaching-3', true),
  ('rest-eat', null, false),
  ('rest-eat', 'rest-eat-1', true),
  ('rest-eat', 'rest-eat-2', true),
  ('rest-eat', 'rest-eat-3', true),
  ('rest-people', null, false),
  ('rest-people', 'rest-people-1', true),
  ('rest-people', 'rest-people-2', true),
  ('rest-people', 'rest-people-3', true),
  ('rest-studio', null, false),
  ('rest-studio', 'rest-studio-1', true),
  ('rest-studio', 'rest-studio-2', true),
  ('rest-studio', 'rest-studio-3', true),
  ('rest-media', null, false),
  ('rest-media', 'rest-media-1', true),
  ('rest-media', 'rest-media-2', true),
  ('rest-media', 'rest-media-3', true),
  ('rest-tech', null, false),
  ('rest-tech', 'rest-tech-1', true),
  ('rest-tech', 'rest-tech-2', true),
  ('rest-tech', 'rest-tech-3', true),
  ('rest-academy', null, false),
  ('rest-academy', 'rest-academy-1', true),
  ('rest-academy', 'rest-academy-2', true),
  ('rest-academy', 'rest-academy-3', true),
  ('rest-franchise', null, false),
  ('rest-franchise', 'rest-franchise-1', true),
  ('rest-franchise', 'rest-franchise-2', true),
  ('rest-franchise', 'rest-franchise-3', true),
  ('rest-space', null, false),
  ('rest-space', 'rest-space-1', true),
  ('rest-space', 'rest-space-2', true),
  ('rest-space', 'rest-space-3', true),
  ('rest-supply', null, false),
  ('rest-supply', 'rest-supply-1', true),
  ('rest-supply', 'rest-supply-2', true),
  ('rest-supply', 'rest-supply-3', true)
on conflict do nothing;
update public.restup_lead_allowlist set published = true where service is null; -- les dix divisions sont toujours sélectionnables

create table if not exists public.restup_leads (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  body_hash text not null,
  form_type text not null check (form_type in ('diagnostic', 'contact')),
  data jsonb not null,
  origin text not null,
  ip_hash text,
  created_at timestamptz not null default now(),
  commercial_status text not null default 'nouveau'
    check (commercial_status in ('nouveau', 'en cours', 'qualifié', 'non qualifié', 'clôturé'))
);
create index if not exists restup_leads_ip_recent on public.restup_leads (ip_hash, created_at);

create table if not exists public.restup_lead_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.restup_leads (id) on delete cascade,
  kind text not null check (kind in ('internal', 'ack')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  unique (lead_id, kind)
);

create table if not exists public.restup_lead_status_history (
  lead_id uuid not null references public.restup_leads (id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id)
);

alter table public.restup_lead_settings enable row level security;
alter table public.restup_lead_allowlist enable row level security;
alter table public.restup_leads enable row level security;
alter table public.restup_lead_notifications enable row level security;
alter table public.restup_lead_status_history enable row level security;

-- Seuls les administrateurs RESTUP (table admins du portail) consultent et qualifient les demandes.
create policy "Admins lisent les demandes" on public.restup_leads for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Admins qualifient les demandes" on public.restup_leads for update
  using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Admins suppriment les demandes" on public.restup_leads for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Admins lisent la file" on public.restup_lead_notifications for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy "Admins lisent l'historique" on public.restup_lead_status_history for all
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Historique automatique des changements d'état commercial
create or replace function public.restup_lead_status_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.commercial_status is distinct from old.commercial_status then
    insert into restup_lead_status_history (lead_id, status, changed_by) values (new.id, new.commercial_status, auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists restup_lead_status_log on public.restup_leads;
create trigger restup_lead_status_log after update on public.restup_leads
  for each row execute procedure public.restup_lead_status_log();

-- Point d'entrée public : validation, liste blanche, origine, débit, idempotence, stockage transactionnel.
-- Retourne {status: 201|200|409|422|429|403, id?, errors?}.
create or replace function public.submit_lead(payload jsonb, idempotency_key text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  s restup_lead_settings;
  hdr json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  origin text := coalesce(hdr ->> 'origin', '');
  ip text := split_part(coalesce(hdr ->> 'x-forwarded-for', ''), ',', 1);
  ip_h text := encode(sha256(convert_to(ip, 'utf8')), 'hex');
  f text := payload ->> 'formType';
  errs jsonb := '{}';
  clean jsonb;
  h text;
  existing restup_leads;
  new_id uuid;
begin
  select * into s from restup_lead_settings where id;
  if not (origin = any (s.allowed_origins)) then return jsonb_build_object('status', 403); end if;
  if idempotency_key !~ '^[A-Za-z0-9-]{8,100}$' then return jsonb_build_object('status', 422, 'errors', jsonb_build_object('idempotencyKey', 'invalid')); end if;
  if octet_length(payload::text) > 16384 then return jsonb_build_object('status', 422, 'errors', jsonb_build_object('form', 'too_large')); end if;
  if coalesce(payload ->> 'website', '') <> '' then return jsonb_build_object('status', 422, 'errors', jsonb_build_object('form', 'invalid')); end if;
  if (select count(*) from restup_leads where ip_hash = ip_h and created_at > now() - s.rate_window) >= s.rate_max then
    return jsonb_build_object('status', 429);
  end if;

  -- Ne garder que les champs du contrat, nettoyés.
  select coalesce(jsonb_object_agg(key, btrim(value)), '{}') into clean
  from jsonb_each_text(payload)
  where key in ('formType','name','email','message','stage','need','service','offer','subject','establishment','city','phone','sites','deadline')
    and btrim(value) <> '';

  if f not in ('diagnostic', 'contact') then errs := errs || '{"formType":"invalid"}'; end if;
  if coalesce(clean ->> 'name', '') = '' or length(clean ->> 'name') > 120 then errs := errs || '{"name":"invalid"}'; end if;
  if coalesce(clean ->> 'email', '') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(clean ->> 'email') > 254 then errs := errs || '{"email":"invalid"}'; end if;
  if length(coalesce(clean ->> 'message', '')) not between 20 and 1500 then errs := errs || '{"message":"invalid"}'; end if;
  if length(coalesce(clean ->> 'establishment', '')) > 120 then errs := errs || '{"establishment":"invalid"}'; end if;
  if length(coalesce(clean ->> 'city', '')) > 100 then errs := errs || '{"city":"invalid"}'; end if;
  if length(coalesce(clean ->> 'phone', '')) > 30 then errs := errs || '{"phone":"invalid"}'; end if;
  if clean ? 'sites' and clean ->> 'sites' not in ('1', '2–5', '6+') then errs := errs || '{"sites":"invalid"}'; end if;
  if clean ? 'deadline' and clean ->> 'deadline' not in ('Ce mois-ci', '1 à 3 mois', 'Plus tard', 'À préciser') then errs := errs || '{"deadline":"invalid"}'; end if;
  if f = 'diagnostic' then
    if coalesce(clean ->> 'stage', '') not in ('En projet', 'En activité', 'Plusieurs établissements', 'Autre') then errs := errs || '{"stage":"invalid"}'; end if;
    if coalesce(clean ->> 'need', '') <> 'aidez-moi-a-choisir'
       and not exists (select 1 from restup_lead_allowlist where division = clean ->> 'need' and service is null) then
      errs := errs || '{"need":"invalid"}';
    end if;
    if clean ? 'service' and not exists (
      select 1 from restup_lead_allowlist
      where division = clean ->> 'need' and service = clean ->> 'service' and (published or s.mode = 'preview')
    ) then errs := errs || '{"service":"invalid"}'; end if;
    if clean ? 'offer' and clean ->> 'offer' not in ('diagnostic', 'sprint', 'suivi') then errs := errs || '{"offer":"invalid"}'; end if;
  elsif f = 'contact' then
    if coalesce(clean ->> 'subject', '') not in ('Question générale', 'Partenariat', 'Autre') then errs := errs || '{"subject":"invalid"}'; end if;
  end if;
  if errs <> '{}' then return jsonb_build_object('status', 422, 'errors', errs); end if;

  clean := jsonb_set(clean, '{email}', to_jsonb(lower(clean ->> 'email')));
  h := encode(sha256(convert_to(clean::text, 'utf8')), 'hex');
  perform pg_advisory_xact_lock(hashtext(idempotency_key));
  select * into existing from restup_leads where restup_leads.idempotency_key = submit_lead.idempotency_key;
  if found then
    if existing.body_hash = h then return jsonb_build_object('status', 200, 'id', existing.id); end if;
    return jsonb_build_object('status', 409);
  end if;

  insert into restup_leads (idempotency_key, body_hash, form_type, data, origin, ip_hash)
    values (submit_lead.idempotency_key, h, f, clean, origin, ip_h) returning id into new_id;
  insert into restup_lead_notifications (lead_id, kind) values (new_id, 'internal'), (new_id, 'ack');
  insert into restup_lead_status_history (lead_id, status) values (new_id, 'nouveau');
  return jsonb_build_object('status', 201, 'id', new_id);
end $$;

revoke all on function public.submit_lead(jsonb, text) from public;
grant execute on function public.submit_lead(jsonb, text) to anon, authenticated;
