# 🥋 TAPEDOJO — RECOMEÇO LIMPO (Porta 2)
### Do zero ao cockpit vivo em ~15 minutos, sem perder nada de produto.
*(Usar somente se o Restart do projeto — Porta 1 — não sanar a infraestrutura.)*

## PASSO 1 — Deletar o projeto doente
Supabase → Settings → General → **Delete project** (digite o nome para confirmar).
*Perde-se apenas: os 3 cadastros de teste (recriados em 1 min no Passo 9).*

## PASSO 2 — Criar o projeto novo
supabase.com → **New Project** → nome `tapedojo` → região **East US (N. Virginia)** → senha do banco (guarde) → Create.
*(Projeto novo já nasce na era das chaves novas — sem cicatriz de migração.)*

## PASSO 3 — Banco inteiro num paste só
SQL Editor → New query → cole o **`supabase/schema.sql` COMPLETO** do projeto → **Run** → "Success".
*(Ele foi construído para banco virgem: tabelas, políticas, segmentos, tudo.)*

## PASSO 4 — Autenticação
Authentication → Sign In / Providers → **Email**: `Enable = ON`, **`Confirm email = OFF`** → Save.
Authentication → URL Configuration → Site URL = `https://tapedojo.school` → Redirect URLs: adicionar `https://tapedojo.school/**` → Save.

## PASSO 5 — Colher as DUAS chaves novas
Settings → API Keys:
- **`sb_publishable_...`** (pública) → copiar
- **`sb_secret_...`** (secreta, Reveal) → copiar — **direto para o Passo 7, nunca por chat**

## PASSO 6 — Uma linha no código (a pública)
Abrir `lib\supabase.js` no Bloco de Notas → localizar a linha `const KEY_ =` → trocar o valor antigo (o eyJ… após o `||`) pela **sb_publishable_ nova** → salvar.
Também na linha `const URL_ =`: trocar a URL antiga pela do projeto novo (`https://SEU-REF-NOVO.supabase.co`).

## PASSO 7 — A secreta na Vercel
Vercel → Settings → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY` → **Edit** → colar a **sb_secret_ nova** → Save.
*(O código já detecta o formato novo sozinho — nada mais a ajustar.)*
Criar/atualizar também `NEXT_PUBLIC_SUPABASE_URL` = `https://SEU-REF-NOVO.supabase.co` (Production + Preview).

## PASSO 8 — Publicar
```powershell
git add .
```
```powershell
git commit -m "Recomeco: projeto Supabase novo (chaves e URL novas)"
```
```powershell
git push
```

## PASSO 9 — Recriar os 3 alunos (e estrear o sino 🔔)
Abra o cockpit `/admin` → aba 📊 → informe o token → **deixe aberto**.
Peça a Joceane e Vagner (e você) para criarem as contas de novo em `tapedojo.school/treinar` — **o sino deve tocar sozinho a cada cadastro**, e os pins nascem no mapa.

## PASSO 10 — Aceite (a régua)
Rodapé: `build curado · alvo SEU-REF-NOVO · cofre 3 · perfis 3 · chave: sb_secret (formato novo)` ✓
💰 Financeiro: Base 47→48 → **Publicar** → "✔ Preços publicados" → voltar 47 ✓
🎁 Cortesias: conceder um Master de teste → aparece na lista ✓
Aí sim: fase encerrada com carimbo.

---
*Regra permanente aprendida: chaves e assinaturas JWT não se mexem no meio de fase — só em janela dedicada, com este roteiro na mão.*
