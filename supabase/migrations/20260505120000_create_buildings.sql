create extension if not exists "pgcrypto";

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  address text not null,
  r_value double precision not null,
  u_value double precision not null,
  ach_value double precision not null,
  lat double precision not null,
  lng double precision not null,
  is_compliant boolean not null default false,
  compliance_details jsonb not null default '{}'::jsonb,
  source text,
  parsed_at timestamptz,
  created_at timestamptz not null default now()
);

create index buildings_user_id_created_at_idx
  on public.buildings (user_id, created_at desc);

alter table public.buildings enable row level security;

create policy buildings_select_own
  on public.buildings for select
  using (auth.uid() = user_id);

create policy buildings_insert_own
  on public.buildings for insert
  with check (auth.uid() = user_id);

create policy buildings_update_own
  on public.buildings for update
  using (auth.uid() = user_id);

create policy buildings_delete_own
  on public.buildings for delete
  using (auth.uid() = user_id);
