# TapeDojo — Treine o olho. Leia o mercado.

Plataforma educacional de leitura de fluxo (order flow): drills com explicação do raciocínio, mercado sintético ao vivo e a Série Mestres (apostila + módulo de treino + exame + certificado). Next.js 14 · PWA · PT/EN/ES no treinador.

> Material educacional com cenários sintéticos. Não são dados reais de mercado nem recomendação de investimento.

## Estrutura

- `/` — hub com os quatro produtos
- `/treinar` — Treinador de Fluxo (v2): perfis, 6 fundamentos, pontos, faixas, relatório, estudo dirigido, teste de 7 dias, planos Base/Plus/Master
- `/live` — Arena LIVE (Master): mercado sintético em tempo real, 3 níveis
- `/mestres/wilder` — Dojo Wilder: Modo Estudo e Modo Pregão, exame e certificado (demonstração)
- `/cursos` — biblioteca com a apostila Wilder em PDF (`public/cursos/`)
- `supabase/schema.sql` — esquema da Fase 2 (progresso na nuvem, certificados, compras)

## Rodar localmente (PowerShell — um comando por vez)

```powershell
cd tapedojo
```
```powershell
npm install --legacy-peer-deps
```
```powershell
npm run dev
```
Abra http://localhost:3000

## Deploy (Vercel)

1. Crie um repositório no GitHub e envie a pasta.
2. No Vercel: **Add New Project** → importe o repositório → framework Next.js é detectado → Deploy.
3. PWA: após o deploy, abra a URL no celular → menu do navegador → **Adicionar à tela inicial**.

## Onde configurar

- **Preços dos planos**: `components/TrainerCore.jsx`, bloco `► PREÇOS` (`PLAN_PRICES`) e franquias em `ALLOWANCE`.
- **Economia de pontos**: constantes `SCENARIO_COST`, `CORRECT_REFUND`, `STREAK_EVERY`, `STREAK_BONUS`, `CREDIT_PACK` no topo do mesmo arquivo.
- **Teste grátis**: `TRIAL_DAYS` no mesmo arquivo.
- **Dificuldade da Arena LIVE**: objeto `LEVELS` em `components/LiveArena.jsx`.
- **Dojo Wilder (modo pregão)**: `TICKS`, `TICK_MS`, `TAIL`, `WINDOW_CANDLES` em `components/DojoWilder.jsx`.

## Estado atual e Fase 2

Nesta versão o progresso é salvo em `localStorage` (por dispositivo). A Fase 2 liga o projeto ao Supabase (auth + tabelas de `supabase/schema.sql`, sincronizando perfis, pontos, certificados) e ao Stripe (checkout dos planos, créditos avulsos e módulos de mestre — os botões de compra já estão marcados como demonstração nos componentes).

## Roadmap da Série Mestres

Wilder (pronto) → Wyckoff → Steidlmayer → Granville → Appel → Bollinger → Donchian → DeMark → Fibonacci e os herdeiros. Cada volume: apostila PDF + Modo Estudo + Modo Pregão + exame de 10 questões + certificado.


## Ciclo de vida e retenção (Fase 3 — fundação já no schema)

O `supabase/schema.sql` (v2) já traz: tabela de **eventos** (com `last_seen_at` automático via trigger), status de assinatura sincronizado por **webhook do Stripe**, **opt-in de marketing + descadastro em 1 clique** (LGPD), **cancelamento com motivo obrigatório** e painel `v_motivos_cancelamento`, **ofertas de retenção limitadas a 1 por cliente** (`td_save_offers`: desconto de 3 meses para motivo preço; pausa de 30/90 dias para motivo não-uso), e os **6 segmentos de clientes como views** (`v_seg_*`) prontos para o painel admin e para as automações de e-mail. Regra da casa: cancelar é fácil (máx. 2 cliques) — a retenção está na oferta, nunca no obstáculo.
