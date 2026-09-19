-- Plan : le client ne peut plus réécrire son plan ni lire les semaines verrouillées.
-- Lecture = fonction qui masque les semaines verrouillées ; écriture = cocher/décocher une tâche débloquée uniquement.
create or replace function public.restup_my_plan() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v jsonb; ci int; mi int; wi int; cyc jsonb; mon jsonb; wk jsonb;
begin
  select data into v from plans where user_id = auth.uid();
  if v is null or coalesce(v->>'status','published') = 'draft' then return null; end if;
  for ci in 0 .. coalesce(jsonb_array_length(v->'cycles'),0) - 1 loop
    for mi in 0 .. coalesce(jsonb_array_length(v->'cycles'->ci->'months'),0) - 1 loop
      for wi in 0 .. coalesce(jsonb_array_length(v->'cycles'->ci->'months'->mi->'weeks'),0) - 1 loop
        if coalesce((v->'cycles'->ci->'months'->mi->'weeks'->wi->>'locked')::boolean,false) then
          v := jsonb_set(v, array['cycles',ci::text,'months',mi::text,'weeks',wi::text,'tasks'], '[]'::jsonb);
        end if;
      end loop;
    end loop;
  end loop;
  return v;
end $$;
grant execute on function public.restup_my_plan() to authenticated;

create or replace function public.restup_set_task_done(p_kind text, p_ci int, p_mi int, p_wi int, p_ti int, p_done boolean) returns void
language plpgsql security definer set search_path = public as $$
declare v jsonb; path text[];
begin
  select data into v from plans where user_id = auth.uid();
  if v is null or coalesce(v->>'status','published') = 'draft' then raise exception 'plan_not_published'; end if;
  if p_kind = 'vision' then path := array['vision_12m','items',p_ti::text];
  elsif p_kind = 'priority' then path := array['priorities_4m','items',p_ti::text];
  elsif p_kind = 'week' then
    path := array['cycles',p_ci::text,'months',p_mi::text,'weeks',p_wi::text];
    if coalesce((v #>> (path || array['locked']))::boolean,false) then raise exception 'week_locked'; end if;
    path := path || array['tasks',p_ti::text];
  else raise exception 'bad_kind'; end if;
  if v #> path is null then raise exception 'task_not_found'; end if;
  v := jsonb_set(v, path || array['done'], to_jsonb(p_done), true);
  v := jsonb_set(v, path || array['done_at'], case when p_done then to_jsonb(now()) else 'null'::jsonb end, true);
  update plans set data = v where user_id = auth.uid();
end $$;
grant execute on function public.restup_set_task_done(text,int,int,int,int,boolean) to authenticated;

drop policy if exists plans_client_update on public.plans;
drop policy if exists plans_client_read on public.plans;
