-- 0002_grants.sql
-- Table-level GRANT-y dla roli authenticated (PostgREST).
-- RLS z 0001 dalej rządzi widocznością WIERSZY — to tylko prawa na TABELE.
-- Na cloud Supabase robią to default privileges; lokalnie trzeba jawnie.

grant usage on schema public to anon, authenticated;

grant select, update on public.profiles to authenticated;

grant select, insert, update, delete on public.products to authenticated;

grant select, insert, delete on public.diary_entries to authenticated;
