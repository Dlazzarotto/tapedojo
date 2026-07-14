import { createClient } from "@supabase/supabase-js";
import { aggregateStats } from "@/lib/adminStats";

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
  const [profiles, states, purchases, cancellations] = await Promise.all([
    db.from("td_profiles").select("user_id, display_name, tier, subscription_status, country, created_at").limit(5000),
    db.from("td_state").select("updated_at").limit(5000),
    db.from("td_purchases").select("amount_cents, currency, sku, created_at").limit(5000),
    db.from("td_cancellations").select("id").limit(5000),
  ]);
  const stats = aggregateStats({
    profiles: profiles.data || [],
    states: states.data || [],
    purchases: purchases.data || [],
    cancellations: cancellations.data || [],
    now: Date.now(),
  });
  return Response.json(stats);
}
