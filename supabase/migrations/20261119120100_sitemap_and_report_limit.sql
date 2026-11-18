-- Fase 6 — lista pública para o sitemap e freio contra denúncias em massa.

-- Repúblicas publicadas que podem ir para o Google (sem as de exemplo).
-- security definer: o público não lê a tabela; aqui só saem slug e data de atualização.
create function public.list_public_republics()
returns table (slug text, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.slug, r.updated_at
  from public.republics r
  where r.status = 'approved'
    and r.is_sample = false
  order by r.updated_at desc
  limit 5000;
$$;

revoke execute on function public.list_public_republics from public;
grant execute on function public.list_public_republics to anon, authenticated;

-- No máximo 10 denúncias por república por hora. Denúncia é anônima (não dá para limitar
-- por pessoa no banco), então o limite é por república: segura robô sem travar quem precisa.
create function public.limit_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.reports
    where republic_id = new.republic_id
      and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'muitas denúncias para esta república agora; tente de novo mais tarde'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger reports_limit
  before insert on public.reports
  for each row execute function public.limit_reports();
