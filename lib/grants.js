// Cortesias (permutas): lógica pura — aplicada no enter() do treinador.
const RANK = { base: 1, plus: 2, master: 3 };
export function tierRank(t) { return RANK[t] || 0; }

// escolhe a melhor cortesia ativa (maior nível; empate = maior prazo)
export function bestGrant(list, now) {
  const act = (list || []).filter((g) => g && RANK[g.tier] && (!g.expires_at || Date.parse(g.expires_at) > now));
  if (!act.length) return null;
  act.sort((a, b) => (RANK[b.tier] - RANK[a.tier]) || ((b.expires_at ? Date.parse(b.expires_at) : Infinity) - (a.expires_at ? Date.parse(a.expires_at) : Infinity)));
  const g = act[0];
  return { tier: g.tier, until: g.expires_at ? Date.parse(g.expires_at) : null };
}

// aplica/expira a cortesia no estado do aluno (muta e devolve d)
export function applyGrant(d, grant, now, allowance) {
  const active = grant && (!grant.until || grant.until > now);
  if (active) {
    const mark = grant.tier + ":" + (grant.until || 0);
    if (tierRank(grant.tier) > tierRank(d.tier)) {
      d.tier = grant.tier;
      d.pro = true;
    }
    d.grant = { tier: grant.tier, until: grant.until || null };
    if (d.grantMark !== mark) {
      d.grantMark = mark;
      const cap = (allowance && allowance[grant.tier]) || 0;
      if (tierRank(grant.tier) >= tierRank(d.tier) && d.points < cap) d.points = cap; // recarga de boas-vindas
    }
  } else if (d.grant) {
    // cortesia venceu: volta ao que era dele de direito
    if (d.grantMark && d.tier === d.grant.tier) { d.tier = null; d.pro = false; }
    delete d.grant;
    delete d.grantMark;
  }
  return d;
}
