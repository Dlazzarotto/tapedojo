import { createClient } from "@supabase/supabase-js";
import { mergePrices, DEFAULT_PRICES } from "@/lib/prices";

export const dynamic = "force-dynamic";

function gate(req) {
  const token = process.env.ADMIN_DASH_TOKEN;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !service) return { err: Response.json({ error: "setup" }, { status: 503 }) };
  if (req.headers.get("x-dojo-token") !== token) return { err: Response.json({ error: "unauthorized" }, { status: 401 }) };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdhhnmzmnjjwdxawuybt.supabase.co";
  return { db: createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Chave legada (JWT): forçar Authorization — é ele quem decide o RLS.
    // Chave nova (sb_secret_): NÃO pôr no Authorization (não é JWT);
    // o gateway injeta o papel service_role a partir do apikey.
    global: { headers: service.startsWith("sb_") ? {} : { Authorization: "Bearer " + service } },
  }) };
}

export async function GET(req) {
  const g = gate(req);
  if (g.err) return g.err;
  const { data } = await g.db.from("td_config").select("value").eq("key", "prices").maybeSingle();
  return Response.json({ prices: mergePrices(DEFAULT_PRICES, data && data.value) });
}

export async function POST(req) {
  const g = gate(req);
  if (g.err) return g.err;
  let body = null;
  try { body = await req.json(); } catch (e) { /* inválido */ }
  const prices = mergePrices(DEFAULT_PRICES, body && body.prices);
  const { error } = await g.db.from("td_config").upsert({ key: "prices", value: prices, updated_at: new Date().toISOString() });
  if (error) return Response.json({ error: "db", detail: error.message }, { status: 500 });
  return Response.json({ ok: true, prices });
}
