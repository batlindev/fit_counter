-- 0001_init.sql
-- Schemat: profiles (z celem kcal), products (katalog), diary_entries (dziennik).

-- ── profiles ─────────────────────────────────────────────────────────────
-- 1:1 z auth.users. Tworzony automatycznie triggerem przy rejestracji.
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text,
  daily_kcal_goal  numeric check (daily_kcal_goal is null or daily_kcal_goal >= 0),
  created_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- trigger: utwórz profil po rejestracji
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── products (wspólny katalog produktów) ────────────────────────────────
-- wartości odżywcze zawsze na 100 g produktu
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kcal        numeric not null check (kcal >= 0),
  protein     numeric not null check (protein >= 0),
  fat         numeric not null check (fat >= 0),
  carbs       numeric not null check (carbs >= 0),
  fiber       numeric check (fiber is null or fiber >= 0),
  salt        numeric check (salt is null or salt >= 0),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- katalog widoczny dla każdego zalogowanego
create policy "products_select_authenticated"
  on public.products for select
  to authenticated
  using (true);

-- każdy zalogowany może dodawać
create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (auth.uid() = created_by);

-- edycja/usuwanie tylko własnych produktów
create policy "products_update_own"
  on public.products for update
  to authenticated
  using (auth.uid() = created_by);

create policy "products_delete_own"
  on public.products for delete
  to authenticated
  using (auth.uid() = created_by);

-- ── diary_entries (dziennik posiłków) ────────────────────────────────────
-- wartości "zamrożone" w momencie dodania — edycja produktu w bazie
-- nie zmienia wstecz już zapisanych wpisów
create table if not exists public.diary_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  grams         numeric not null check (grams > 0),
  kcal          numeric not null check (kcal >= 0),
  protein       numeric not null check (protein >= 0),
  fat           numeric not null check (fat >= 0),
  carbs         numeric not null check (carbs >= 0),
  meal_type     text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  entry_date    date not null default current_date,
  created_at    timestamptz not null default now()
);

alter table public.diary_entries enable row level security;

create policy "diary_select_own"
  on public.diary_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "diary_insert_own"
  on public.diary_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "diary_delete_own"
  on public.diary_entries for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists diary_entries_user_date_idx
  on public.diary_entries (user_id, entry_date);
