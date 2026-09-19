-- Plusieurs développeurs / gérants (accès complet). Aligné avec DEV_EMAILS dans portail/supabase-client.js.
create or replace function public.is_dev() returns boolean
language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) in ('box.of.kom@gmail.com','antoinebarat1@gmail.com')
$$;
