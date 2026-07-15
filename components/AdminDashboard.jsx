"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { pieArc } from "@/lib/adminStats";
import { supabase } from "@/lib/supabase";

const AdminMap = dynamic(() => import("@/components/AdminMap"), { ssr: false, loading: () => <p style={{ color: "#A9AEDB" }}>Carregando o mapa…</p> });

const C = { bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278", orange: "#F47B20", buy: "#22C55E", sell: "#F05252", text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F" };
const TIER_LABEL = { free: "Grátis/Trial", base: "Base", plus: "Plus", master: "Master" };
const TIER_COLOR = { free: "#7C83C9", base: "#22C55E", plus: "#F47B20", master: "#F5C518" };
const fmtBR = (v) => "R$ " + v.toLocaleString("pt-BR");
const fmtUS = (v) => "US$ " + v.toLocaleString("en-US");

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(() => { try { return sessionStorage.getItem("td:dash:token") || ""; } catch (e) { return ""; } });
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [drill, setDrill] = useState(null);
  const [pop, setPop] = useState(null);
  const prevTotal = useRef(null);
  const popTimer = useRef(null);

  async function load(tk) {
    setErr(null);
    try {
      const r = await fetch("/api/admin/stats?t=" + Date.now(), { cache: "no-store", headers: { "x-dojo-token": tk } });
      const j = await r.json();
      if (!r.ok) { setErr(j); setStats(null); return; }
      if (prevTotal.current !== null && j.total > prevTotal.current) {
        const novo = j.recent && j.recent[0] ? j.recent[0].name : "";
        setPop("🔔 +" + (j.total - prevTotal.current) + " inscrito" + (j.total - prevTotal.current > 1 ? "s" : "") + (novo ? ": " + novo : ""));
        if (popTimer.current) clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => setPop(null), 8000);
      }
      prevTotal.current = j.total;
      setStats(j);
      try { sessionStorage.setItem("td:dash:token", tk); } catch (e) { /* ok */ }
    } catch (e) { setErr({ error: "network" }); }
  }

  useEffect(() => {
    if (!saved) return;
    load(saved);
    const t = setInterval(() => load(saved), 10000);
    const onFocus = () => load(saved);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    // sino em tempo real: cadastro novo → busca imediata
    const ch = supabase.channel("td-live");
    ch.on("broadcast", { event: "signup" }, () => load(saved)).subscribe();
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      try { supabase.removeChannel(ch); } catch (e) { /* ok */ }
    };
  }, [saved]);

  const input = { width: "100%", fontSize: 17, padding: "12px 14px", borderRadius: 12, border: "2px solid " + C.grid, background: C.bg, color: C.text };
  const cardS = { background: C.surface, border: "1px solid " + C.grid, borderRadius: 16, padding: 16 };

  if (!saved) {
    return (
      <div style={{ ...cardS, maxWidth: 460 }}>
        <p style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>🔐 Token do Dashboard</p>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 12 }}>O token definido em ADMIN_DASH_TOKEN (variável de ambiente na Vercel).</p>
        <input style={input} type="password" value={token} onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && token) setSaved(token); }} placeholder="Token" />
        <button onClick={() => token && setSaved(token)}
          style={{ width: "100%", minHeight: 50, background: C.orange, color: "#231000", fontWeight: 800, fontSize: 17, border: "none", borderRadius: 12, marginTop: 10, cursor: "pointer" }}>
          Abrir o cockpit
        </button>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ ...cardS, borderColor: C.sell }}>
        <p style={{ color: C.sell, fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
          {err.error === "setup" ? "⚙ Configuração pendente" : err.error === "unauthorized" ? "Token incorreto" : "Falha de rede"}
        </p>
        <p style={{ color: C.muted, fontSize: 15.5, marginBottom: 12 }}>
          {err.error === "setup" ? (err.detail || "Defina as variáveis de ambiente na Vercel e faça um novo deploy.")
            : err.error === "unauthorized" ? "Confira o valor de ADMIN_DASH_TOKEN."
            : "Sem resposta do servidor — tente de novo."}
        </p>
        <button onClick={() => { setSaved(""); setErr(null); try { sessionStorage.removeItem("td:dash:token"); } catch (e) {} }}
          style={{ background: C.navy, color: "#fff", fontWeight: 800, border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}>
          Trocar token
        </button>
      </div>
    );
  }

  if (!stats) return <p style={{ color: C.muted }}>Carregando o cockpit…</p>;

  const tiers = ["free", "base", "plus", "master"];
  const totalPie = tiers.reduce((a, t) => a + (stats.byTier[t] || 0), 0) || 1;
  let angle = -Math.PI / 2;
  const slices = tiers.map((t) => {
    const frac = (stats.byTier[t] || 0) / totalPie;
    const a0 = angle, a1 = angle + frac * 2 * Math.PI;
    angle = a1;
    return { t, a0, a1, n: stats.byTier[t] || 0 };
  });
  const mrrOf = (t) => (t === "free" ? { br: 0, intl: 0 } : stats.mrr[t]);

  return (
    <div>
      {pop && (
        <div style={{ ...cardS, borderColor: C.buy, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔔</span>
          <span style={{ color: C.buy, fontWeight: 900, fontSize: 18 }}>{pop}</span>
        </div>
      )}
      {stats.warns && stats.warns.length > 0 && (
        <div style={{ ...cardS, borderColor: C.orange, marginBottom: 14 }}>
          <p style={{ color: C.orange, fontWeight: 800, marginBottom: 6 }}>⚠ Migrações pendentes no banco</p>
          {stats.warns.map((w, i) => (
            <p key={i} style={{ color: C.muted, fontSize: 14.5 }}>{w}</p>
          ))}
        </div>
      )}
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 14 }}>
        <div style={cardS}><p style={{ color: C.muted, fontSize: 13.5, fontWeight: 800, textTransform: "uppercase" }}>Inscritos</p>
          <p style={{ fontSize: 30, fontWeight: 900 }}>{stats.total}</p></div>
        <div style={cardS}><p style={{ color: C.muted, fontSize: 13.5, fontWeight: 800, textTransform: "uppercase" }}>Online agora</p>
          <p style={{ fontSize: 30, fontWeight: 900, color: C.buy }}>● {stats.online}</p></div>
        <div style={cardS}><p style={{ color: C.muted, fontSize: 13.5, fontWeight: 800, textTransform: "uppercase" }}>A receber (mês)</p>
          <p style={{ fontSize: 19, fontWeight: 900 }}>{fmtBR(stats.receivable.br)}</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: C.muted }}>{fmtUS(stats.receivable.intl)}</p></div>
        <div style={cardS}><p style={{ color: C.muted, fontSize: 13.5, fontWeight: 800, textTransform: "uppercase" }}>Cancelamentos</p>
          <p style={{ fontSize: 30, fontWeight: 900, color: C.sell }}>{stats.cancellationsCount}</p></div>
      </div>

      {/* mapa-múndi */}
      <div style={{ ...cardS, marginBottom: 14 }}>
        <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>🌍 Acessos por país</p>
        <AdminMap byCountry={stats.byCountry} />
      </div>

      {/* pizza por nível + financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
        <div style={cardS}>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>🥧 Alunos por nível de acesso <span style={{ color: C.muted, fontWeight: 700, fontSize: 14 }}>(toque na fatia)</span></p>
          <svg viewBox="0 0 220 220" style={{ width: "100%", maxWidth: 300, display: "block", margin: "0 auto" }}>
            {slices.map((s) => s.n > 0 && (
              <path key={s.t} d={pieArc(110, 110, 92, s.a0, s.a1)} fill={TIER_COLOR[s.t]}
                stroke={C.bg} strokeWidth="3" style={{ cursor: "pointer", opacity: drill && drill !== s.t ? 0.35 : 1 }}
                onClick={() => setDrill(drill === s.t ? null : s.t)} />
            ))}
            <circle cx="110" cy="110" r="46" fill={C.surface} />
            <text x="110" y="104" textAnchor="middle" fill={C.text} fontSize="26" fontWeight="900">{stats.total}</text>
            <text x="110" y="126" textAnchor="middle" fill={C.muted} fontSize="12" fontWeight="700">alunos</text>
          </svg>
          <div className="flex flex-wrap gap-2" style={{ justifyContent: "center", marginTop: 8 }}>
            {tiers.map((t) => (
              <button key={t} onClick={() => setDrill(drill === t ? null : t)}
                style={{ background: drill === t ? TIER_COLOR[t] : C.navy, color: drill === t ? "#12143A" : "#fff", fontWeight: 800, fontSize: 13.5, border: "none", borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>
                {TIER_LABEL[t]} · {stats.byTier[t] || 0}
              </button>
            ))}
          </div>
          {drill && (
            <div style={{ background: C.card, borderRadius: 12, padding: 12, marginTop: 10 }}>
              <p style={{ fontWeight: 900, color: TIER_COLOR[drill], marginBottom: 4 }}>{TIER_LABEL[drill]}</p>
              <p style={{ color: C.text, fontSize: 15.5 }}>Alunos: <b>{stats.byTier[drill] || 0}</b></p>
              <p style={{ color: C.text, fontSize: 15.5 }}>MRR: <b>{fmtBR(mrrOf(drill).br)}</b> + <b>{fmtUS(mrrOf(drill).intl)}</b></p>
              {drill !== "free" && <p style={{ color: C.muted, fontSize: 14 }}>Preço: R$ {stats.prices[drill].br}/mês · US$ {stats.prices[drill].intl}/mo</p>}
              {drill === "free" && <p style={{ color: C.muted, fontSize: 14 }}>Trial de 7 dias — o funil de conversão começa aqui.</p>}
            </div>
          )}
        </div>

        <div style={cardS}>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>💰 Financeiro</p>
          {[
            ["Feito (avulsos + cobranças)", fmtBR(stats.earned.BRL) + "  ·  " + fmtUS(stats.earned.USD), C.buy],
            ["Cancelado (MRR perdido)", fmtBR(stats.canceled.br) + "  ·  " + fmtUS(stats.canceled.intl), C.sell],
            ["Saldo atual", fmtBR(stats.earned.BRL) + "  ·  " + fmtUS(stats.earned.USD), C.text],
            ["A receber (MRR ativo)", fmtBR(stats.receivable.br) + "  ·  " + fmtUS(stats.receivable.intl), C.orange],
          ].map(([k, v, col]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, borderBottom: "1px solid " + C.grid, padding: "10px 0" }}>
              <span style={{ color: C.muted, fontSize: 15 }}>{k}</span>
              <span style={{ color: col, fontWeight: 800, fontSize: 15.5, textAlign: "right" }}>{v}</span>
            </div>
          ))}
          <p style={{ color: C.muted, fontSize: 13.5, marginTop: 10 }}>
            Os valores acendem sozinhos quando o Stripe entrar (Fase 2B) — a estrutura já lê as tabelas reais.
          </p>
        </div>
      </div>

      {/* últimos cadastros */}
      <div style={cardS}>
        <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>🆕 Últimos cadastros</p>
        {stats.recent.length === 0 && <p style={{ color: C.muted }}>Os primeiros alunos aparecem aqui.</p>}
        {stats.recent.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderBottom: "1px solid " + C.grid, padding: "8px 0", fontSize: 15 }}>
            <span style={{ fontWeight: 700 }}>{r.name || "—"} <span style={{ color: C.muted }}>({r.country})</span></span>
            <span style={{ color: TIER_COLOR[r.tier] || C.muted, fontWeight: 800 }}>{TIER_LABEL[r.tier] || r.tier}</span>
          </div>
        ))}
      </div>
      <p style={{ color: C.muted, fontSize: 13.5, marginTop: 10 }}>Tempo real: sino de cadastro + varredura 10s + ao focar a aba · build {stats.version || "antigo"} · alvo {stats.target || "?"} · cofre {stats.cofre ?? "?"} · perfis {stats.perfisRaw ?? "?"} · chave: {stats.keyKind || "?"}</p>
    </div>
  );
}
