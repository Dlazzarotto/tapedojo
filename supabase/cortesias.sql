-- ═══ TapeDojo · Cortesias (permutas/parcerias) — incremento ═══
create table if not exists td_grants (
  id bigint generated always as identity primary key,
  email text not null,
  tier text not null check (tier in ('base','plus','master')),
  note text,
  expires_at timestamptz,           -- null = permanente
  created_at timestamptz not null default now()
);
create index if not exists td_grants_email on td_grants (lower(email));
alter table td_grants enable row level security;
drop policy if exists "own grant read" on td_grants;
create policy "own grant read" on td_grants for select
  using (lower(email) = lower(coalesce(auth.email(), '')));
-- escrita/remoção: somente service role (sala Cortesias do cockpit)
