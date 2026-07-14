-- ═══════════════════════════════════════════════════════════════
-- TapeDojo · Fase 2/3 — esquema Supabase v2
-- Produto + ciclo de vida completo: eventos, assinatura (Stripe),
-- consentimento de e-mail, cancelamento com motivos, ofertas de
-- retenção (1 por cliente) e os 6 segmentos como views prontas.
-- Aplique no SQL Editor. RLS em todas as tabelas; o painel admin
-- acessa via service role (nunca exposto no frontend).
-- ═══════════════════════════════════════════════════════════════

-- ── Perfis (aluno) ──
create table if not exists td_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  lang text not null default 'pt',
  tier text check (tier in ('base','plus','master')),
  points integer not null default 1000,
  points_month text not null,
  trial_start timestamptz not null default now(),
  -- ciclo de vida
  last_seen_at timestamptz,
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial','active','past_due','paused','canceled')),
  current_period_end timestamptz,
  canceled_at timestamptz,
  stripe_customer_id text,
  -- e-mail (LGPD): transacional sempre; marketing só com opt-in
  marketing_opt_in boolean not null default false,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Eventos de uso (a matéria-prima de TODO o marketing) ──
-- tipos sugeridos: login, drill, drill_correto, live_pregao,
-- sensei_pergunta, curso_download, ponto_gasto, upgrade, downgrade
create table if not exists td_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists td_events_user_time on td_events (user_id, created_at desc);
create index if not exists td_events_type_time on td_events (type, created_at desc);

-- last_seen_at se atualiza sozinho a cada evento
create or replace function td_touch_last_seen() returns trigger
language plpgsql security definer as $$
begin
  update td_profiles set last_seen_at = new.created_at where user_id = new.user_id;
  return new;
end $$;
drop trigger if exists trg_td_touch_last_seen on td_events;
create trigger trg_td_touch_last_seen after insert on td_events
  for each row execute function td_touch_last_seen();

-- ── Progresso, erros, certificados, compras (produto) ──
create table if not exists td_progress (
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  total integer not null default 0,
  correct integer not null default 0,
  primary key (user_id, category)
);

create table if not exists td_mistakes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  chosen text not null,
  correct text not null,
  created_at timestamptz not null default now()
);

create table if not exists td_certificates (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  master text not null,
  mode text not null,
  score integer not null,
  issued_at timestamptz not null default now()
);

create table if not exists td_purchases (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  sku text not null,
  provider text not null default 'stripe',
  provider_ref text,
  amount_cents integer,
  currency text default 'BRL',
  created_at timestamptz not null default now()
);

-- ── Cancelamento: motivo é obrigatório, comentário opcional ──
create table if not exists td_cancellations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in
    ('preco','nao_uso','faltou_recurso','dificil_usar','achou_alternativa','problema_tecnico','outro')),
  comment text,
  offer_shown text,              -- qual oferta foi apresentada
  offer_accepted boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Ofertas de retenção: UMA por cliente, para sempre ──
-- desconto_3m_50 (preço) · pausa_30 / pausa_90 (não uso)
create table if not exists td_save_offers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kind text not null check (kind in ('desconto_3m_50','pausa_30','pausa_90')),
  granted_at timestamptz not null default now(),
  redeemed boolean not null default false,
  expires_at timestamptz
);

-- ── Supressão de e-mail (descadastro 1 clique / bounce) ──
create table if not exists td_email_suppression (
  email text primary key,
  reason text not null default 'unsubscribe',  -- unsubscribe | bounce | complaint
  created_at timestamptz not null default now()
);

-- ═══ RLS ═══
alter table td_profiles enable row level security;
alter table td_events enable row level security;
alter table td_progress enable row level security;
alter table td_mistakes enable row level security;
alter table td_certificates enable row level security;
alter table td_purchases enable row level security;
alter table td_cancellations enable row level security;
alter table td_save_offers enable row level security;
alter table td_email_suppression enable row level security;

create policy "own profile" on td_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own events read" on td_events for select using (auth.uid() = user_id);
create policy "own events insert" on td_events for insert with check (auth.uid() = user_id);
create policy "own progress" on td_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own mistakes" on td_mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own certificates" on td_certificates for select using (auth.uid() = user_id);
create policy "own purchases" on td_purchases for select using (auth.uid() = user_id);
create policy "own cancellation insert" on td_cancellations for insert with check (auth.uid() = user_id);
create policy "own offers read" on td_save_offers for select using (auth.uid() = user_id);
-- supressão de e-mail: somente service role (sem policy de usuário)

-- ═══ OS 6 SEGMENTOS (views prontas para painel e automações) ═══

-- 1. Inscreveu e nunca ativou (zero treinos) — o vazamento nº 1
create or replace view v_seg_nunca_ativou as
select p.* from td_profiles p
where not exists (select 1 from td_events e where e.user_id = p.user_id and e.type = 'drill')
  and p.created_at < now() - interval '1 day';

-- 2. Ativou e abandonou no trial
create or replace view v_seg_trial_abandonou as
select p.* from td_profiles p
where p.subscription_status = 'trial'
  and p.trial_start < now() - interval '7 days'
  and (p.last_seen_at is null or p.last_seen_at < now() - interval '3 days');

-- 3. Pagante ativo (saudável)
create or replace view v_seg_pagante_ativo as
select p.* from td_profiles p
where p.subscription_status = 'active'
  and p.last_seen_at >= now() - interval '14 days';

-- 4. Pagante que não acessa — churn futuro: agir AGORA
create or replace view v_seg_pagante_inativo as
select p.* from td_profiles p
where p.subscription_status = 'active'
  and (p.last_seen_at is null or p.last_seen_at < now() - interval '14 days');

-- 5. Cancelou mas ainda usa — candidato a win-back
create or replace view v_seg_cancelou_usa as
select p.* from td_profiles p
where p.subscription_status = 'canceled'
  and p.last_seen_at >= now() - interval '14 days';

-- 6. Cancelou e sumiu
create or replace view v_seg_cancelou_sumiu as
select p.* from td_profiles p
where p.subscription_status = 'canceled'
  and (p.last_seen_at is null or p.last_seen_at < now() - interval '14 days');

-- Painel de motivos de cancelamento + taxa de aceite das ofertas
create or replace view v_motivos_cancelamento as
select reason,
       count(*) as total,
       count(*) filter (where offer_accepted) as aceitaram_oferta,
       round(100.0 * count(*) filter (where offer_accepted) / count(*), 1) as taxa_aceite_pct
from td_cancellations
group by reason
order by total desc;

-- E-mails de marketing elegíveis (opt-in, sem supressão)
create or replace view v_marketing_eligiveis as
select p.user_id, u.email, p.display_name, p.lang, p.subscription_status, p.last_seen_at
from td_profiles p
join auth.users u on u.id = p.user_id
where p.marketing_opt_in = true
  and p.unsubscribed_at is null
  and not exists (select 1 from td_email_suppression s where s.email = u.email);

-- ═══ Notas de implementação ═══
-- · subscription_status é alimentado por webhook do Stripe
--   (customer.subscription.updated/deleted, invoice.payment_failed → past_due).
-- · Fluxo de cancelar (máx. 2 cliques até confirmar, por lei e por respeito):
--   motivo → oferta condicionada ao motivo (preco → desconto_3m_50;
--   nao_uso → pausa_30/90; faltou_recurso → feedback) → confirmar sempre visível.
-- · td_save_offers tem user_id como chave primária: 1 oferta por vida.
-- · Descadastro de marketing: link de 1 clique grava unsubscribed_at
--   e insere em td_email_suppression. Transacionais continuam.

-- ── Parceiro do Dojo: anúncio recompensado (Fase 2 — config global) ──
create table if not exists td_partner_ads (
  id bigint generated always as identity primary key,
  enabled boolean not null default false,
  headline text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  media_url text not null,
  link_url text,
  duration_s integer not null default 30,
  reward_points integer not null default 20,
  daily_cap integer not null default 3,
  audience text[] not null default array['free'],   -- 'free' | 'base' (nunca plus/master)
  created_at timestamptz not null default now()
);
alter table td_partner_ads enable row level security;
create policy "ads read enabled" on td_partner_ads for select using (enabled = true);
-- escrita: somente service role (painel do mestre)

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

-- ═══ TapeDojo · Admin Dashboard — incremento ═══
alter table td_profiles add column if not exists country text;
create index if not exists td_profiles_country on td_profiles (country);

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
