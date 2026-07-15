// Agregador puro do Dashboard do Mestre — roda no servidor e nos testes.
const PRICE = {
  base: { br: 47, intl: 19 },
  plus: { br: 87, intl: 39 },
  master: { br: 197, intl: 89 },
};
const TIERS = ["free", "base", "plus", "master"];

export function aggregateStats({ profiles, states, purchases, cancellations, now }) {
  const tierOf = (p) => (p.tier && TIERS.includes(p.tier) ? p.tier : "free");
  const byTier = { free: 0, base: 0, plus: 0, master: 0 };
  const byCountry = {};
  const mrr = { base: { br: 0, intl: 0 }, plus: { br: 0, intl: 0 }, master: { br: 0, intl: 0 } };
  let canceled = { br: 0, intl: 0 };

  (profiles || []).forEach((p) => {
    byTier[tierOf(p)]++;
    const c = (p.country || "??").toUpperCase();
    byCountry[c] = (byCountry[c] || 0) + 1;
    const zone = c === "BR" ? "br" : "intl";
    if (p.tier && PRICE[p.tier]) {
      if (p.subscription_status === "canceled") canceled[zone] += PRICE[p.tier][zone];
      else mrr[p.tier][zone] += PRICE[p.tier][zone];
    }
  });

  const fiveMin = 5 * 60 * 1000;
  const online = (states || []).filter((st) => now - new Date(st.updated_at).getTime() < fiveMin).length;

  const earned = { BRL: 0, USD: 0 };
  (purchases || []).forEach((x) => {
    const cur = (x.currency || "BRL").toUpperCase() === "BRL" ? "BRL" : "USD";
    earned[cur] += (x.amount_cents || 0) / 100;
  });

  const recv = {
    br: mrr.base.br + mrr.plus.br + mrr.master.br,
    intl: mrr.base.intl + mrr.plus.intl + mrr.master.intl,
  };

  const recent = (profiles || [])
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map((p) => ({ name: p.display_name, country: p.country || "??", tier: tierOf(p), at: p.created_at }));

  return {
    total: (profiles || []).length,
    byTier, byCountry, online, mrr, canceled, earned,
    receivable: recv,
    cancellationsCount: (cancellations || []).length,
    recent,
    prices: PRICE,
  };
}

// geometria da pizza (pura, testável)
export function pieArc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return "M " + cx + " " + cy + " L " + x0.toFixed(2) + " " + y0.toFixed(2) +
    " A " + r + " " + r + " 0 " + large + " 1 " + x1.toFixed(2) + " " + y1.toFixed(2) + " Z";
}

// Reconciliação: usuários do auth sem linha em td_profiles (auto-cura do Dashboard)
export function missingProfiles(authUsers, profiles) {
  const have = new Set((profiles || []).map((p) => p.user_id));
  return (authUsers || [])
    .filter((u) => u && u.id && !have.has(u.id))
    .map((u) => ({
      user_id: u.id,
      display_name:
        (u.user_metadata && u.user_metadata.display_name) ||
        ((u.email || "aluno").split("@")[0]),
      lang: "en",
      points_month: new Date().toISOString().slice(0, 7),
      marketing_opt_in: !!(u.user_metadata && u.user_metadata.marketing_opt_in),
      created_at: u.created_at || new Date().toISOString(),
    }));
}

// Lê o papel (role) embutido num JWT do Supabase — sem validar assinatura.
export function jwtRole(token) {
  try {
    const seg = (token || "").split(".");
    if (seg.length !== 3) return null;
    const b64 = seg[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json).role || null;
  } catch (e) { return null; }
}
