-- RestUp — migration 2 (appliquée) : paiement, profil équipe (photo), documents, KPI, stockage privé.
-- Idempotence partielle : les "create policy" échouent si rejoués (les supprimer d'abord si besoin).

-- Paiement (suivi manuel par le coach ; le client ne peut pas le modifier : voir profiles_guard)
alter table public.profiles add column if not exists paid boolean default false, add column if not exists amount_paid numeric default 0, add column if not exists months_paid int default 0, add column if not exists payment_note text;

-- Profil équipe : nom affiché + photo (lisible par les clients pour "Ton coach")
create table if not exists public.staff_profiles (user_id uuid primary key references auth.users(id) on delete cascade, display_name text, photo_url text, updated_at timestamptz default now());
alter table public.staff_profiles enable row level security;
create policy staff_profiles_read on public.staff_profiles for select to authenticated using (true);
create policy staff_profiles_insert on public.staff_profiles for insert to authenticated with check (user_id = auth.uid() and public.is_staff());
create policy staff_profiles_update on public.staff_profiles for update to authenticated using (user_id = auth.uid() and public.is_staff()) with check (user_id = auth.uid() and public.is_staff());

-- Avatars (bucket public, uploads limités au dossier de l'utilisateur équipe, 2 Mo, images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_insert on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and public.is_staff() and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated using (bucket_id = 'avatars' and public.is_staff() and (storage.foldername(name))[1] = auth.uid()::text);

-- Garde des colonnes sensibles (voir migration 1) étendue au paiement
create or replace function public.profiles_guard() returns trigger language plpgsql set search_path = public as $$ begin if current_user = 'authenticated' and auth.uid() is not null and not public.can_access_client(old.id) then new := jsonb_populate_record(new, to_jsonb(new) || coalesce((select jsonb_object_agg(k, to_jsonb(old) -> k) from unnest(array['coach_id','closer_id','access_granted','active','onboarding_status','onboarding_completed_at','audit_scheduled_at','paid','amount_paid','months_paid','payment_note']) k where to_jsonb(old) ? k), '{}'::jsonb)); end if; return new; end $$;

-- Coach visible par le client (nom + photo)
create or replace function public.restup_my_coach() returns jsonb language sql stable security definer set search_path = public as $$ select coalesce((select jsonb_build_object('name', coalesce(s.display_name, t.name), 'email', t.email, 'phone', t.phone, 'photo', s.photo_url) from public.profiles p join public.team_members t on t.id = p.coach_id left join public.staff_profiles s on s.user_id = t.user_id where p.id = auth.uid()), 'null'::jsonb) $$;

-- Demandes de documents (coach -> client)
create table if not exists public.document_requests (id uuid primary key default gen_random_uuid(), client_id uuid not null, label text not null, note text, status text not null default 'requested' check (status in ('requested','received')), file_path text, requested_by uuid default auth.uid(), created_at timestamptz not null default now(), received_at timestamptz);
alter table public.document_requests enable row level security;
create policy docreq_staff on public.document_requests for all to authenticated using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy docreq_client_read on public.document_requests for select to authenticated using (client_id = auth.uid());
create policy docreq_client_update on public.document_requests for update to authenticated using (client_id = auth.uid()) with check (client_id = auth.uid());

-- Stockage privé des fichiers client (le bucket existait en PUBLIC : passé en privé, accès par URL signées)
create or replace function public.can_access_folder(f text) returns boolean language plpgsql stable security definer set search_path = public as $$ begin return public.can_access_client(f::uuid); exception when others then return false; end $$;
grant execute on function public.can_access_folder(text) to authenticated;
insert into storage.buckets (id, name, public, file_size_limit) values ('client-files','client-files',false,15728640) on conflict (id) do nothing;
update storage.buckets set public = false where id = 'client-files';
create policy cf_client_insert on storage.objects for insert to authenticated with check (bucket_id = 'client-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy cf_client_read on storage.objects for select to authenticated using (bucket_id = 'client-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy cf_staff_all on storage.objects for all to authenticated using (bucket_id = 'client-files' and public.can_access_folder((storage.foldername(name))[1])) with check (bucket_id = 'client-files' and public.can_access_folder((storage.foldername(name))[1]));

-- KPI : bibliothèque -> assignation -> valeurs saisies par le client
create table if not exists public.kpi_templates (id uuid primary key default gen_random_uuid(), name text not null, unit text not null default '', frequency text not null default 'week' check (frequency in ('week','month')), created_by uuid default auth.uid(), created_at timestamptz not null default now());
create table if not exists public.kpi_assignments (id uuid primary key default gen_random_uuid(), client_id uuid not null, template_id uuid not null references public.kpi_templates(id) on delete cascade, target numeric, created_at timestamptz not null default now(), unique (client_id, template_id));
create table if not exists public.kpi_values (id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.kpi_assignments(id) on delete cascade, client_id uuid not null, period text not null, value numeric not null, created_at timestamptz not null default now(), unique (assignment_id, period));
alter table public.kpi_templates enable row level security;
alter table public.kpi_assignments enable row level security;
alter table public.kpi_values enable row level security;
create policy kpit_staff on public.kpi_templates for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy kpit_client_read on public.kpi_templates for select to authenticated using (exists (select 1 from public.kpi_assignments a where a.template_id = kpi_templates.id and a.client_id = auth.uid()));
create policy kpia_staff on public.kpi_assignments for all to authenticated using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy kpia_client_read on public.kpi_assignments for select to authenticated using (client_id = auth.uid());
create policy kpiv_staff on public.kpi_values for all to authenticated using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy kpiv_client_read on public.kpi_values for select to authenticated using (client_id = auth.uid());
create policy kpiv_client_insert on public.kpi_values for insert to authenticated with check (client_id = auth.uid() and exists (select 1 from public.kpi_assignments a where a.id = assignment_id and a.client_id = auth.uid()));
create policy kpiv_client_update on public.kpi_values for update to authenticated using (client_id = auth.uid()) with check (client_id = auth.uid());
