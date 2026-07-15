-- ═══ TapeDojo · GARANTIA DE ESQUEMA (idempotente) ═══
-- Assegura todas as colunas/tabelas que o cockpit consulta.
alter table td_profiles add column if not exists display_name text;
alter table td_profiles add column if not exists tier text;
alter table td_profiles add column if not exists subscription_status text not null default 'trial';
alter table td_profiles add column if not exists marketing_opt_in boolean not null default false;
alter table td_profiles add column if not exists points integer not null default 1000;
alter table td_profiles add column if not exists points_month text;
alter table td_profiles add column if not exists lang text not null default 'en';
alter table td_profiles add column if not exists phone text;
alter table td_profiles add column if not exists country text;
alter table td_profiles add column if not exists trial_start timestamptz not null default now();
alter table td_profiles add column if not exists created_at timestamptz not null default now();

create table if not exists td_purchases (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  sku text,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  created_at timestamptz not null default now()
);
alter table td_purchases enable row level security;

create table if not exists td_cancellations (
  id bigint generated always as identity primary key,
  user_id uuid,
  reason text,
  created_at timestamptz not null default now()
);
alter table td_cancellations enable row level security;
