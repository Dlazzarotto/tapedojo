-- ═══ TapeDojo · Preços editáveis — incremento ═══
create table if not exists td_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table td_config enable row level security;
drop policy if exists "config public read" on td_config;
create policy "config public read" on td_config for select using (true);
-- escrita: somente service role (rota segura do cockpit)

insert into td_config (key, value) values (
  'prices',
  '{"base":{"br":47,"intl":19},"plus":{"br":87,"intl":39},"master":{"br":197,"intl":89}}'::jsonb
) on conflict (key) do nothing;
