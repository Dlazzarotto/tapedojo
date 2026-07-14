// Preços como dados: td_config (Supabase) é a fonte da verdade;
// estes padrões são o fallback quando a rede falha.
export const DEFAULT_PRICES = {
  base: { br: 47, intl: 19 },
  plus: { br: 87, intl: 39 },
  master: { br: 197, intl: 89 },
};

export function mergePrices(base, over) {
  const out = { base: { ...base.base }, plus: { ...base.plus }, master: { ...base.master } };
  if (!over || typeof over !== "object") return out;
  ["base", "plus", "master"].forEach((t) => {
    ["br", "intl"].forEach((z) => {
      const v = over[t] && over[t][z];
      if (typeof v === "number" && isFinite(v) && v > 0) out[t][z] = Math.round(v);
    });
  });
  return out;
}

export async function fetchPrices(supabase) {
  try {
    const { data } = await supabase.from("td_config").select("value").eq("key", "prices").maybeSingle();
    return mergePrices(DEFAULT_PRICES, data && data.value);
  } catch (e) {
    return mergePrices(DEFAULT_PRICES, null);
  }
}
