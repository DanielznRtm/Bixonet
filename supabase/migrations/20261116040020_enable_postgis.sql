-- Fase 0: só liga o PostGIS. As tabelas entram na Fase 1 (skill bixo-dados).
-- O schema "extensions" é o padrão do Supabase para extensões, fora do "public" exposto pela API.
create extension if not exists postgis with schema extensions;
