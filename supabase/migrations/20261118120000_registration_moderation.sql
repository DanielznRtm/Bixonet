-- Fase 5 — cadastro pelos donos e moderação pelo admin.

-- ---------------------------------------------------------------------------
-- Colunas de moderação
-- ---------------------------------------------------------------------------
alter table public.republics
  add column moderation_note text check (char_length(moderation_note) <= 500),
  add column reviewed_at timestamptz;

comment on column public.republics.moderation_note is
  'Motivo da recusa (o dono vê em "Minhas reps").';
comment on column public.republics.reviewed_at is
  'Última revisão do admin. Publicada com updated_at > reviewed_at = alteração ainda não revisada.';

-- ---------------------------------------------------------------------------
-- Trava de moderação (substitui a da Fase 1)
-- O dono pode: editar o conteúdo; arquivar; reenviar para análise uma república recusada
-- ou arquivada. Não pode: aprovar, recusar, verificar, mexer nos campos de moderação, trocar
-- o dono ou apontar fotos para fora da própria pasta do Storage.
-- ---------------------------------------------------------------------------
create or replace function public.protect_moderation_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;

  if new.owner_user_id is distinct from old.owner_user_id then
    raise exception 'só um admin pode trocar o dono da república'
      using errcode = '42501';
  end if;

  if new.verified is distinct from old.verified
     or new.is_sample is distinct from old.is_sample
     or new.moderation_note is distinct from old.moderation_note
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'só um admin pode mudar os campos de moderação'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status
     and not (
       new.status = 'archived'
       or (new.status = 'pending' and old.status in ('rejected', 'archived'))
     ) then
    raise exception 'o dono só pode arquivar ou reenviar para análise; aprovação é feita por um admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Regras do cadastro feito pelo dono (insert e update)
-- ---------------------------------------------------------------------------
-- Sem security definer de propósito: current_user precisa ser quem está editando
-- (anon/authenticated), e o dono já enxerga as próprias repúblicas pelo RLS.
create function public.check_owner_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  pending_count integer;
  photo text;
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;

  -- No máximo 3 repúblicas em análise por pessoa (freio contra spam).
  if new.status = 'pending'
     and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    select count(*) into pending_count
    from public.republics
    where owner_user_id = new.owner_user_id
      and status = 'pending'
      and id <> new.id;
    if pending_count >= 3 then
      raise exception 'você já tem 3 repúblicas em análise; espere a revisão para cadastrar outra'
        using errcode = '23514';
    end if;
  end if;

  -- Fotos só do Storage do próprio dono (evita trocar por imagens de fora depois de aprovada).
  foreach photo in array coalesce(new.photos, '{}') loop
    if position(
      '/storage/v1/object/public/republic-photos/' || new.owner_user_id::text || '/' in photo
    ) = 0 then
      raise exception 'foto fora da pasta do dono: %', photo using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

create trigger republics_check_owner_submission
  before insert or update on public.republics
  for each row execute function public.check_owner_submission();

-- ---------------------------------------------------------------------------
-- Fotos: bucket público com nomes aleatórios; cada dono só escreve na própria pasta
-- (republic-photos/<user_id>/<uuid>.webp). Admin pode apagar qualquer foto.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'republic-photos',
  'republic-photos',
  true,
  5 * 1024 * 1024,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "republic-photos: dono envia na própria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'republic-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "republic-photos: dono ou admin apaga"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'republic-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

-- O upload do supabase-js lê o objeto de volta; o dono precisa enxergar os próprios.
create policy "republic-photos: dono vê os próprios"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'republic-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );
