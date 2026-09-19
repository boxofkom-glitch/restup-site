-- Copilote coach : comptes rendus de call (résumé, décisions, engagements, tâches, risques, questions, récap WhatsApp)
create table if not exists public.call_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  call_id uuid,
  author_id uuid default auth.uid(),
  kind text not null default 'suivi',
  notes text,
  summary text,
  decisions jsonb not null default '[]'::jsonb,
  commitments jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  recap text,
  validated boolean not null default false,
  validated_at timestamptz,
  recap_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists call_reports_client_idx on public.call_reports (client_id, created_at desc);
alter table public.call_reports enable row level security;
drop policy if exists call_reports_staff on public.call_reports;
create policy call_reports_staff on public.call_reports for all to authenticated
  using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create or replace function public.restup_my_last_recap() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('recap', recap, 'at', coalesce(recap_sent_at, created_at))
  from call_reports where client_id = auth.uid() and validated and recap_sent_at is not null
  order by created_at desc limit 1
$$;
grant execute on function public.restup_my_last_recap() to authenticated;
