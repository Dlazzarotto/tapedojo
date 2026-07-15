import { createClient } from "@supabase/supabase-js";
import { aggregateStats, missingProfiles, jwtRole, jwtRef, authToProfiles, keyKind } from "@/lib/adminStats";

export const dynamic = "force-dynamic";

// A service_role NUNCA entra no navegador: vive em variável de ambiente
// na Vercel e só roda aqui, no servidor. O painel se autentica com o
// token ADMIN_DASH_TOKEN (também env) enviado no header x-dojo-token.
export async function GET(req) {
  const token = process.env.ADMIN_DASH_TOKEN;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdhhnmzmnjjwdxawuybt.supabase.co";
  if (!token || !service) {
    return Response.json({ error: "setup", detail: "Defina ADMIN_DASH_TOKEN e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel." }, { status: 503 });
  }
  if (req.headers.get("x-dojo-token") !== token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = createClient(url, service, { auth: { persistSession: false } });
  const [profiles, states, purchases, cancellations, authRes] = await Promise.all([
    db.from("td_profiles").select("user_id, display_name, tier, subscription_status, country, created_at").limit(5000),
    db.from("td_state").select("updated_at").limit(5000),
    db.from("td_purchases").select("amount_cents, currency, sku, created_at").limit(5000),
    db.from("td_cancellations").select("id").limit(5000),
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  // avisos: tabela/coluna ausente deixa de ser silêncio — vira alerta nomeado
  const warns = [];
  // autodiagnóstico da chave: a service_role carrega role "service_role" no próprio token
  if (service.startsWith("sb_publishable_")) {
    warns.push("⚠ CHAVE ERRADA: o valor em SUPABASE_SERVICE_ROLE_KEY é a sb_publishable_ (PÚBLICA, sem poder). A secreta começa com sb_secret_ (aba API Keys) ou é o JWT service_role (aba legada, botão Reveal). Troque na Vercel e faça Redeploy no item do TOPO.");
  }
  const role = jwtRole(service);
  if (role && role !== "service_role") {
    warns.push('⚠ CHAVE ERRADA: a variável SUPABASE_SERVICE_ROLE_KEY contém a chave "' + role + '" (a pública). Supabase → Settings → API → service_role → botão REVEAL → copiar → colar na Vercel → Redeploy.');
  }
  if (authRes && authRes.error) {
    warns.push("auth.admin: " + authRes.error.message + " — sintoma clássico de chave sem poder no lugar da service_role.");
  }
  const ref = jwtRef(service);
  if (ref && !url.includes(ref)) {
    warns.push('⚠ CHAVE DE OUTRO PROJETO: o token pertence ao projeto "' + ref + '", mas esta rota fala com ' + url + '. Copie a service_role DESTE projeto (Settings → API → Reveal) e faça Redeploy.');
  }
  const authUsersCount = (authRes && authRes.data && authRes.data.users ? authRes.data.users.length : 0);
  if (warns.length === 0 && authUsersCount === 0) {
    warns.push("O cofre de logins retornou vazio — se há usuários em Authentication → Users, a chave em uso não tem poder de admin (anon no lugar da service_role) ou é de outro projeto.");
  }
  if (profiles.error) warns.push("td_profiles: " + profiles.error.message + " → rode tapedojo-admin-dash.sql");
  if (states.error) warns.push("td_state: " + states.error.message + " → rode supabase/fase2a.sql");
  if (purchases.error) warns.push("td_purchases: " + purchases.error.message + " → rode o schema.sql completo");
  if (cancellations.error) warns.push("td_cancellations: " + cancellations.error.message + " → rode o schema.sql completo");

  // auto-cura: todo login no cofre ganha perfil (upsert tolerante — cria só quem falta)
  let allProfiles = profiles.data || [];
  try {
    const authUsers = (authRes && authRes.data && authRes.data.users) || [];
    const missing = missingProfiles(authUsers, allProfiles);
    if (missing.length) {
      const ins = await db
        .from("td_profiles")
        .upsert(missing, { onConflict: "user_id", ignoreDuplicates: true })
        .select("user_id, display_name, tier, subscription_status, country, created_at");
      if (ins.data) allProfiles = allProfiles.concat(ins.data);
      if (ins.error) warns.push("auto-cura: " + ins.error.message);
    }
  } catch (e) { /* melhor esforço */ }
  // diag-4: o cofre (comprovadamente funcional) é a base dos inscritos;
  // a tabela de perfis apenas enriquece com nível/país quando disponível.
  const authUsersAll = (authRes && authRes.data && authRes.data.users) || [];
  const merged = authUsersAll.length ? authToProfiles(authUsersAll, allProfiles) : allProfiles;
  const stats = aggregateStats({
    profiles: merged,
    states: states.data || [],
    purchases: purchases.data || [],
    cancellations: cancellations.data || [],
    now: Date.now(),
  });
  return Response.json({
    ...stats, warns,
    version: "diag-5",
    keyKind: keyKind(service),
    target: url.replace("https://", "").split(".")[0],
    cofre: authUsersCount,
    perfisRaw: (profiles.data || []).length,
  });
}
