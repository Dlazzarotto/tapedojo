-- ═══ TapeDojo · Fase 2A — incremento (rodar no SQL Editor) ═══
-- Telefone no perfil + estado do dojo sincronizado na nuvem.

alter table td_profiles add column if not exists phone text;

create table if not exists td_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table td_state enable row level security;
drop policy if exists "own state" on td_state;
create policy "own state" on td_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
