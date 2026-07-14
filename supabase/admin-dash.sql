-- ═══ TapeDojo · Admin Dashboard — incremento ═══
alter table td_profiles add column if not exists country text;
create index if not exists td_profiles_country on td_profiles (country);
