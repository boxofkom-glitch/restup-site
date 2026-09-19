-- RestUp — Golden Path P0 : sécurité, invitations, onboarding, timeline.
-- Idempotente (rejouable). À exécuter dans Supabase > SQL Editor.

-- ============ 1. Colonnes ============
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists coach_id uuid;
alter table public.profiles add column if not exists closer_id uuid;
alter table public.profiles add column if not exists onboarding jsonb;
alter table public.profiles add column if not exists onboarding_status text;
alter table public.profiles add column if not exists onboarding_completed_at timestamptz;
alter table public.profiles add column if not exists access_granted boolean;
alter table public.profiles add column if not exists audit_scheduled_at timestamptz;

-- Comptes existants = déjà en service : accès accordé, onboarding considéré terminé.
update public.profiles set access_granted = true where access_granted is null;
update public.profiles set onboarding_status = 'completed' where onboarding_status is null;
alter table public.profiles alter column access_granted set default false;
alter table public.profiles alter column onboarding_status set default 'not_started';

alter table public.calls add column if not exists kind text default 'call';
alter table public.calls add column if not exists scheduled_at timestamptz;
alter table public.calls add column if not exists notes text;

-- ============ 2. Invitations client ============
create table if not exists public.client_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text, last_name text, phone text, company_name text,
  coach_id uuid references public.team_members(id) on delete set null,
  status text not null default 'invited' check (status in ('invited','accepted','revoked')),
  invited_by uuid default auth.uid(),
  invited_at timestamptz not null default now(),
  last_sent_at timestamptz not null default now(),
  send_count int not null default 1,
  accepted_at timestamptz,
  user_id uuid
);
create unique index if not exists client_invitations_email_active
  on public.client_invitations (lower(email)) where status in ('invited','accepted');

-- ============ 3. Timeline ============
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid,
  type text not null,
  actor_id uuid default auth.uid(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_client_idx on public.events (client_id, created_at desc);

-- ============ 4. Fonctions d'autorisation ============
create or replace function public.is_dev() returns boolean
language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) = 'box.of.kom@gmail.com'
$$;

create or replace function public.my_team_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.team_members where user_id = auth.uid() and role = 'coach' limit 1
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_dev() or public.my_team_id() is not null
$$;

create or replace function public.can_access_client(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_dev() or (
    public.my_team_id() is not null and exists (
      select 1 from public.profiles p where p.id = cid and p.coach_id = public.my_team_id()
    )
  )
$$;

-- ============ 5. RLS : on repart d'une base propre ============
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('profiles','audits','plans','calls','messages','team_members','admins','client_invitations','events')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.profiles            enable row level security;
alter table public.audits              enable row level security;
alter table public.plans               enable row level security;
alter table public.calls               enable row level security;
alter table public.messages            enable row level security;
alter table public.team_members        enable row level security;
alter table public.admins              enable row level security;
alter table public.client_invitations  enable row level security;
alter table public.events              enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.can_access_client(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.can_access_client(id))
  with check (id = auth.uid() or public.can_access_client(id));

-- audits : le client ne voit QUE l'audit publié ; seul le staff écrit
create policy audits_staff on public.audits for all to authenticated
  using (public.can_access_client(user_id)) with check (public.can_access_client(user_id));
create policy audits_client_read on public.audits for select to authenticated
  using (user_id = auth.uid() and coalesce(data ->> 'status','published') <> 'draft');

-- plans : le staff gère ; le client lit/coche ses tâches (durci en P1 via RPC)
create policy plans_staff on public.plans for all to authenticated
  using (public.can_access_client(user_id)) with check (public.can_access_client(user_id));
create policy plans_client_read on public.plans for select to authenticated
  using (user_id = auth.uid() and coalesce(data ->> 'status','published') <> 'draft');
create policy plans_client_update on public.plans for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- calls / messages
create policy calls_staff on public.calls for all to authenticated
  using (public.can_access_client(user_id)) with check (public.can_access_client(user_id));
create policy calls_client_read on public.calls for select to authenticated using (user_id = auth.uid());
create policy calls_client_request on public.calls for insert to authenticated
  with check (user_id = auth.uid() and status = 'requested');

create policy messages_staff on public.messages for all to authenticated
  using (public.can_access_client(user_id)) with check (public.can_access_client(user_id));
create policy messages_client_read on public.messages for select to authenticated using (user_id = auth.uid());
create policy messages_client_insert on public.messages for insert to authenticated with check (user_id = auth.uid());

-- équipe : seul le dev écrit ; un coach lit sa propre fiche
create policy team_dev on public.team_members for all to authenticated
  using (public.is_dev()) with check (public.is_dev());
create policy team_self_read on public.team_members for select to authenticated using (user_id = auth.uid());

-- admins (legacy) : lecture de sa propre ligne, écriture dev uniquement (fini l'auto-insertion)
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());
create policy admins_dev on public.admins for all to authenticated
  using (public.is_dev()) with check (public.is_dev());

-- invitations : dev = tout ; coach = celles de ses clients
create policy invitations_staff on public.client_invitations for all to authenticated
  using (public.is_dev() or (public.my_team_id() is not null and coach_id = public.my_team_id()))
  with check (public.is_dev() or (public.my_team_id() is not null and coach_id = public.my_team_id()));

-- timeline
create policy events_read on public.events for select to authenticated
  using (public.can_access_client(client_id));
create policy events_insert on public.events for insert to authenticated
  with check (actor_id = auth.uid() and (client_id = auth.uid() or public.can_access_client(client_id)));

-- ============ 6. Garde-fou colonnes sensibles de profiles ============
-- SECURITY INVOKER volontaire : current_user vaut 'authenticated' pour une requête directe du client,
-- mais 'postgres' à l'intérieur des fonctions security definer (activation, onboarding), qui restent libres.
create or replace function public.profiles_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user = 'authenticated' and auth.uid() is not null and not public.can_access_client(old.id) then
    new := jsonb_populate_record(new, to_jsonb(new) || coalesce((
      select jsonb_object_agg(k, to_jsonb(old) -> k)
      from unnest(array['coach_id','closer_id','access_granted','active','onboarding_status','onboarding_completed_at','audit_scheduled_at']) k
      where to_jsonb(old) ? k
    ), '{}'::jsonb));
  end if;
  return new;
end $$;drop trigger if exists profiles_guard_trg on public.profiles;
create trigger profiles_guard_trg before update on public.profiles
  for each row execute function public.profiles_guard();

-- ============ 7. RPC ============
-- Activation : rattache le compte authentifié à son invitation (client) ou à sa fiche équipe (coach).
create or replace function public.restup_claim_account() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_uid uuid := auth.uid();
  v_inv public.client_invitations%rowtype;
  v_tm uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select id into v_tm from public.team_members
   where role = 'coach' and lower(email) = v_email and (user_id is null or user_id = v_uid) limit 1;
  if v_tm is not null then
    update public.team_members set user_id = v_uid where id = v_tm;
    insert into public.events (client_id, type, actor_id, payload) values (null, 'team.activated', v_uid, jsonb_build_object('team_member_id', v_tm));
    return jsonb_build_object('role','coach');
  end if;

  select * into v_inv from public.client_invitations
   where lower(email) = v_email and status in ('invited','accepted') limit 1;
  if v_inv.id is null then
    return jsonb_build_object('role','client','access',false);
  end if;

  update public.profiles set
    access_granted = true,
    first_name = coalesce(v_inv.first_name, first_name),
    last_name = coalesce(v_inv.last_name, last_name),
    phone = coalesce(v_inv.phone, phone),
    company_name = coalesce(v_inv.company_name, company_name),
    coach_id = coalesce(v_inv.coach_id, coach_id)
  where id = v_uid;

  if v_inv.status = 'invited' then
    update public.client_invitations set status = 'accepted', accepted_at = now(), user_id = v_uid where id = v_inv.id;
    insert into public.events (client_id, type, actor_id, payload) values (v_uid, 'account.activated', v_uid, '{}'::jsonb);
    if v_inv.coach_id is not null then
      insert into public.events (client_id, type, actor_id, payload) values (v_uid, 'coach.assigned', v_uid, jsonb_build_object('coach_id', v_inv.coach_id));
    end if;
  end if;
  return jsonb_build_object('role','client','access',true);
end $$;

-- Onboarding : sauvegarde (autosave) et fin.
create or replace function public.restup_save_onboarding(answers jsonb, complete boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_status text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.profiles where id = v_uid and access_granted) then
    raise exception 'access not granted';
  end if;
  v_status := case when complete then 'completed' else 'in_progress' end;
  update public.profiles set
    onboarding = answers,
    onboarding_status = case when onboarding_status = 'completed' then 'completed' else v_status end,
    onboarding_completed_at = case when complete and onboarding_completed_at is null then now() else onboarding_completed_at end,
    company_name = coalesce(nullif(answers ->> 'company',''), company_name)
  where id = v_uid;
  if complete then
    insert into public.events (client_id, type, actor_id, payload) values (v_uid, 'onboarding.completed', v_uid, '{}'::jsonb);
  end if;
  return jsonb_build_object('status', v_status);
end $$;

-- Coach visible par le client (nom/téléphone uniquement).
create or replace function public.restup_my_coach() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object('name', t.name, 'email', t.email, 'phone', t.phone)
    from public.profiles p join public.team_members t on t.id = p.coach_id
    where p.id = auth.uid()
  ), 'null'::jsonb)
$$;

grant execute on function public.restup_claim_account() to authenticated;
grant execute on function public.restup_save_onboarding(jsonb, boolean) to authenticated;
grant execute on function public.restup_my_coach() to authenticated;
grant execute on function public.is_dev(), public.is_staff(), public.my_team_id(), public.can_access_client(uuid) to authenticated;
