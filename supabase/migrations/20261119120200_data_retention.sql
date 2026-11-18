-- Fase 6 — prazo de guarda prometido em /privacidade: denúncias resolvidas são apagadas
-- depois de 12 meses. A limpeza roda todo dia às 4h (UTC) dentro do próprio banco.

create extension if not exists pg_cron;

select cron.schedule(
  'apagar-denuncias-resolvidas',
  '0 4 * * *',
  $$ delete from public.reports where resolved_at < now() - interval '12 months' $$
);
