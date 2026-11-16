-- Fase 1 — quem pode ler e escrever o quê.
--
-- Resumo:
--   anon (público)  -> lê cidades, instituições e imóveis ativos; repúblicas SÓ pelas funções
--                      (search_republics etc.); pode criar denúncia de república aprovada.
--   authenticated   -> dono cria a própria república (pending) e edita as suas,
--                      sem mexer nos campos de moderação.
--   admin           -> usuário listado em public.admins; modera tudo.
--
-- Por que repúblicas não têm leitura pública direta: RLS filtra LINHAS, não COLUNAS.
-- Pela tabela, o público veria owner_user_id e consent_at. Pelas funções, só o que elas devolvem.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- security definer: lê public.admins ignorando o RLS dela, para poder ser usada nas policies.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- A república existe e está aprovada? (usada na policy de denúncias, que roda como anon)
create function public.is_public_republic(p_republic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.republics where id = p_republic_id and status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS em todas as tabelas
-- ---------------------------------------------------------------------------
alter table public.cities enable row level security;
alter table public.institutions enable row level security;
alter table public.republics enable row level security;
alter table public.republic_institutions enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;
alter table public.admins enable row level security;

-- O Supabase dá todas as permissões de tabela para anon/authenticated por padrão.
-- Tiramos o que o público nunca deve ter, além do RLS (defesa em camadas).
revoke all on public.republics from anon;
revoke all on public.republic_institutions from anon;
revoke all on public.admins from anon;
revoke select, update, delete on public.reports from anon;
revoke insert, update, delete on public.admins from authenticated;

-- ---------------------------------------------------------------------------
-- cities / institutions: leitura pública, escrita só admin
-- ---------------------------------------------------------------------------
create policy "cities: leitura pública"
  on public.cities for select to anon, authenticated using (true);
create policy "cities: admin escreve"
  on public.cities for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "institutions: leitura pública"
  on public.institutions for select to anon, authenticated using (true);
create policy "institutions: admin escreve"
  on public.institutions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- republics
-- ---------------------------------------------------------------------------
create policy "republics: dono ou admin lê"
  on public.republics for select to authenticated
  using (owner_user_id = (select auth.uid()) or (select public.is_admin()));

-- Dono só cria a própria, como pendente, sem selo e sem ser exemplo.
create policy "republics: dono cria pendente"
  on public.republics for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      owner_user_id = (select auth.uid())
      and status = 'pending'
      and verified = false
      and is_sample = false
    )
  );

-- O que o dono pode mudar em cada campo é checado pela trigger protect_moderation_fields.
create policy "republics: dono ou admin edita"
  on public.republics for update to authenticated
  using (owner_user_id = (select auth.uid()) or (select public.is_admin()))
  with check (owner_user_id = (select auth.uid()) or (select public.is_admin()));

create policy "republics: admin apaga"
  on public.republics for delete to authenticated
  using ((select public.is_admin()));

-- RLS não protege colunas. Esta trigger impede o dono de se aprovar sozinho,
-- de se dar o selo "verificada" ou de passar a república para outra pessoa.
-- Ele pode, sim, arquivar a própria república (pedido de remoção).
create function public.protect_moderation_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Migrations, seed e chave secreta (postgres/service_role) e admins passam direto.
  if current_user not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;

  if new.owner_user_id is distinct from old.owner_user_id then
    raise exception 'só um admin pode trocar o dono da república'
      using errcode = '42501';
  end if;

  if new.verified is distinct from old.verified
     or new.is_sample is distinct from old.is_sample then
    raise exception 'só um admin pode mudar verified ou is_sample'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status and new.status <> 'archived' then
    raise exception 'o dono só pode arquivar a república; aprovação é feita por um admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger republics_protect_moderation_fields
  before update on public.republics
  for each row execute function public.protect_moderation_fields();

-- ---------------------------------------------------------------------------
-- republic_institutions: segue o dono da república
-- ---------------------------------------------------------------------------
create policy "republic_institutions: dono ou admin lê"
  on public.republic_institutions for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.republics r
      where r.id = republic_id and r.owner_user_id = (select auth.uid())
    )
  );

create policy "republic_institutions: dono ou admin escreve"
  on public.republic_institutions for all to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.republics r
      where r.id = republic_id and r.owner_user_id = (select auth.uid())
    )
  )
  with check (
    (select public.is_admin())
    or exists (
      select 1 from public.republics r
      where r.id = republic_id and r.owner_user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- listings: leitura pública dos ativos, escrita só admin
-- ---------------------------------------------------------------------------
create policy "listings: leitura pública dos ativos"
  on public.listings for select to anon, authenticated
  using (status = 'active' or (select public.is_admin()));
create policy "listings: admin escreve"
  on public.listings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- reports: qualquer um denuncia república aprovada; só admin lê e resolve
-- ---------------------------------------------------------------------------
create policy "reports: qualquer um cria"
  on public.reports for insert to anon, authenticated
  with check (resolved_at is null and public.is_public_republic(republic_id));

create policy "reports: admin lê"
  on public.reports for select to authenticated
  using ((select public.is_admin()));
create policy "reports: admin resolve"
  on public.reports for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reports: admin apaga"
  on public.reports for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- admins: admin vê a lista; inclusão só por SQL com a chave secreta
-- ---------------------------------------------------------------------------
create policy "admins: admin lê"
  on public.admins for select to authenticated
  using ((select public.is_admin()));
