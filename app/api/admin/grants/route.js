import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function gate(req) {
  const token = process.env.ADMIN_DASH_TOKEN;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !service) return { err: Response.json({ error: "setup" }, { status: 503 }) };
  if (req.headers.get("x-dojo-token") !== token) return { err: Response.json({ error: "unauthorized" }, { status: 401 }) };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdhhnmzmnjjwdxawuybt.supabase.co";
  return { db: createClient(url, service, { auth: { persistSession: false } }) };
}

export async function GET(req) {
  const g = gate(req);
  if (g.err) return g.err;
  const { data } = await g.db.from("td_grants").select("*").order("created_at", { ascending: false }).limit(200);
  return Response.json({ grants: data || [] });
}

export async function POST(req) {
  const g = gate(req);
  if (g.err) return g.err;
  let b = null;
  try { b = await req.json(); } catch (e) { /* inválido */ }
  const email = (b && b.email || "").trim().toLowerCase();
  const tier = b && b.tier;
  const days = b && b.days;
  if (!email.includes("@") || !["base", "plus", "master"].includes(tier)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const expires_at = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
  const { data, error } = await g.db.from("td_grants").insert({ email, tier, note: (b.note || "").slice(0, 200), expires_at }).select().single();
  if (error) return Response.json({ error: "db", detail: error.message }, { status: 500 });
  return Response.json({ ok: true, grant: data });
}

export async function DELETE(req) {
  const g = gate(req);
  if (g.err) return g.err;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "invalid" }, { status: 400 });
  const { error } = await g.db.from("td_grants").delete().eq("id", id);
  if (error) return Response.json({ error: "db" }, { status: 500 });
  return Response.json({ ok: true });
}
