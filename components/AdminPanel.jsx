"use client";
import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import { DEFAULT_PRICES } from "@/lib/prices";

// ═══════════════════════════════════════════════════════════════
// TAPEDOJO — PAINEL DO MESTRE · Marketing (Parceiro do Dojo)
// Configura o anúncio recompensado: mídia (imagem/vídeo), público
// (grátis / Base — nunca Plus/Master), créditos por visualização,
// duração e teto diário. v1: a configuração vale neste navegador
// (demonstração da mecânica); a Fase 2 grava no Supabase
// (td_partner_ads) e passa a valer para todos os alunos.
// ═══════════════════════════════════════════════════════════════

const ADMIN_PASS = "dojo2026"; // ► TROQUE esta senha antes de divulgar a rota

const C = {
  bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278",
  orange: "#F47B20", buy: "#22C55E", sell: "#F05252",
  text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F",
};

const DEFAULT_CFG = {
  enabled: false,
  headline: "",
  mediaType: "image",           // 'image' | 'video'
  mediaUrl: "/parceiro-placeholder.png",
  linkUrl: "",
  durationS: 30,
  rewardPoints: 20,
  dailyCap: 3,
  audience: ["free"],           // 'free' (teste grátis) e/ou 'base'
};

function load() {
  try { const v = localStorage.getItem("td:ad:config"); return v ? { ...DEFAULT_CFG, ...JSON.parse(v) } : { ...DEFAULT_CFG }; }
  catch (e) { return { ...DEFAULT_CFG }; }
}

export default function AdminPanel() {
  const [ok, setOk] = useState(false);
  const [pass, setPass] = useState("");
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [section, setSection] = useState("dash"); // dash | mkt | fin | arch
  const [fin, setFin] = useState({ prices: null, msg: null, err: null });
  const [vip, setVip] = useState({ list: null, email: "", tier: "master", days: 90, note: "", msg: null, err: null });

  function dashToken() {
    try { return sessionStorage.getItem("td:dash:token") || ""; } catch (e) { return ""; }
  }

  useEffect(() => {
    if (section !== "vip" || vip.list) return;
    const tk = dashToken();
    if (!tk) { setVip((v) => ({ ...v, err: "token" })); return; }
    fetch("/api/admin/grants", { headers: { "x-dojo-token": tk } })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => setVip((v) => (ok ? { ...v, list: j.grants, err: null } : { ...v, err: j.error || "erro" })))
      .catch(() => setVip((v) => ({ ...v, err: "network" })));
  }, [section]);

  async function grantAccess() {
    const tk = dashToken();
    setVip((v) => ({ ...v, msg: null, err: null }));
    const body = { email: vip.email, tier: vip.tier, days: vip.days === 0 ? null : vip.days, note: vip.note };
    const r = await fetch("/api/admin/grants", { method: "POST", headers: { "Content-Type": "application/json", "x-dojo-token": tk }, body: JSON.stringify(body) });
    const j = await r.json();
    if (r.ok) setVip((v) => ({ ...v, list: [j.grant, ...(v.list || [])], email: "", note: "", msg: "✔ Cortesia concedida — vale no próximo login do parceiro (ou no primeiro cadastro com esse e-mail)." }));
    else setVip((v) => ({ ...v, err: j.error || "erro" }));
  }

  async function revokeGrant(id) {
    const tk = dashToken();
    const r = await fetch("/api/admin/grants?id=" + id, { method: "DELETE", headers: { "x-dojo-token": tk } });
    if (r.ok) setVip((v) => ({ ...v, list: (v.list || []).filter((g) => g.id !== id), msg: "Cortesia revogada." }));
  }

  useEffect(() => {
    if (section !== "fin" || fin.prices) return;
    let tk = "";
    try { tk = sessionStorage.getItem("td:dash:token") || ""; } catch (e) { /* ok */ }
    if (!tk) { setFin({ prices: null, msg: null, err: "token" }); return; }
    fetch("/api/admin/config", { headers: { "x-dojo-token": tk } })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => setFin(ok ? { prices: j.prices, msg: null, err: null } : { prices: null, msg: null, err: j.error || "erro" }))
      .catch(() => setFin({ prices: null, msg: null, err: "network" }));
  }, [section]);

  function setPx(t, z, v) {
    setFin((f) => ({ ...f, msg: null, prices: { ...f.prices, [t]: { ...f.prices[t], [z]: v } } }));
  }

  async function savePrices() {
    let tk = "";
    try { tk = sessionStorage.getItem("td:dash:token") || ""; } catch (e) { /* ok */ }
    const clean = {};
    ["base", "plus", "master"].forEach((t) => {
      clean[t] = { br: parseInt(fin.prices[t].br, 10) || DEFAULT_PRICES[t].br, intl: parseInt(fin.prices[t].intl, 10) || DEFAULT_PRICES[t].intl };
    });
    const r = await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json", "x-dojo-token": tk }, body: JSON.stringify({ prices: clean }) });
    const j = await r.json();
    if (r.ok) setFin({ prices: j.prices, msg: "✔ Preços publicados — o site inteiro já está vendo os novos valores.", err: null });
    else setFin((f) => ({ ...f, err: j.error || "erro", msg: null }));
  }
  const [left, setLeft] = useState(0);

  useEffect(() => { setCfg(load()); }, []);
  useEffect(() => {
    if (!preview) return;
    setLeft(cfg.durationS || 30);
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [preview]);

  function set(k, v) { setCfg((c) => ({ ...c, [k]: v })); setSaved(false); }
  function toggleAud(a) {
    setCfg((c) => {
      const has = c.audience.includes(a);
      return { ...c, audience: has ? c.audience.filter((x) => x !== a) : [...c.audience, a] };
    });
    setSaved(false);
  }
  function save() {
    try { localStorage.setItem("td:ad:config", JSON.stringify(cfg)); setSaved(true); } catch (e) {}
  }

  const btn = { minHeight: 54, fontSize: 18, fontWeight: 800, borderRadius: 14, border: "none", cursor: "pointer" };
  const input = { width: "100%", fontSize: 18, padding: "12px 14px", borderRadius: 12, border: "2px solid " + C.grid, background: C.surface, color: C.text };
  const label = { display: "block", color: C.muted, fontWeight: 800, fontSize: 15, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" };

  if (!ok) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: C.surface, border: "2px solid " + C.orange, borderRadius: 18, padding: 24, maxWidth: 420, width: "100%" }}>
          <p style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>🥋 Painel do Mestre</p>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 16 }}>Área restrita — marketing do TapeDojo.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) setOk(true); }}
            placeholder="Senha do mestre" style={input} />
          <button onClick={() => pass === ADMIN_PASS && setOk(true)}
            style={{ ...btn, width: "100%", background: C.orange, color: "#231000", marginTop: 12, padding: 14 }}>
            Entrar
          </button>
          {pass && pass !== ADMIN_PASS && <p style={{ color: C.sell, fontWeight: 700, marginTop: 10, fontSize: 15 }}>Senha incorreta.</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 18, lineHeight: 1.5 }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p style={{ fontSize: 26, fontWeight: 800 }}>
          Tape<span style={{ color: C.orange }}>Dojo</span>
          <span style={{ color: C.orange, fontWeight: 800, fontSize: 15, border: "2px solid " + C.orange, borderRadius: 999, padding: "2px 12px", marginLeft: 10, verticalAlign: "middle" }}>PAINEL DO MESTRE</span>
        </p>
        <div className="flex flex-wrap items-center gap-2" style={{ margin: "10px 0 18px" }}>
          {[["dash", "📊 Dashboard"], ["mkt", "📣 Marketing"], ["fin", "💰 Financeiro"], ["vip", "🎁 Cortesias"]].map(([id, nm]) => (
            <button key={id} onClick={() => setSection(id)}
              style={{ ...btn, minHeight: 46, padding: "8px 16px", fontSize: 16, background: section === id ? C.orange : C.navy, color: section === id ? "#231000" : "#fff" }}>
              {nm}
            </button>
          ))}
          <button onClick={() => setSection("arch")} aria-label="Arquitetura do negócio" title="Arquitetura do negócio"
            style={{ ...btn, minHeight: 46, minWidth: 48, fontSize: 20, background: section === "arch" ? C.orange : C.navy, color: section === "arch" ? "#231000" : "#fff", marginLeft: "auto" }}>
            ⚙
          </button>
        </div>

        {section === "dash" && <AdminDashboard />}

        {section === "fin" && (
          <section style={{ background: C.surface, border: "1px solid " + C.grid, borderRadius: 18, padding: 20 }}>
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>💰 Financeiro — preços vivos</p>
            <p style={{ color: C.muted, fontSize: 14.5, marginBottom: 14 }}>
              Fonte da verdade: td_config no Supabase. Salvar aqui muda o site inteiro em segundos — sem código, sem deploy. Cliente existente mantém o preço contratado (regra da 2B/Stripe).
            </p>
            {fin.err === "token" && <p style={{ color: C.orange, fontWeight: 700 }}>Abra o 📊 Dashboard e informe o token uma vez — o Financeiro usa a mesma chave.</p>}
            {fin.err && fin.err !== "token" && <p style={{ color: C.sell, fontWeight: 700 }}>Falha: {fin.err}</p>}
            {!fin.prices && !fin.err && <p style={{ color: C.muted }}>Carregando preços…</p>}
            {fin.prices && (
              <div>
                {["base", "plus", "master"].map((t) => (
                  <div key={t} className="grid grid-cols-3 gap-3 items-center" style={{ borderBottom: "1px solid " + C.grid, padding: "10px 0" }}>
                    <span style={{ fontWeight: 800, textTransform: "capitalize" }}>{t}</span>
                    <div>
                      <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>R$ / mês (BR)</label>
                      <input type="number" min="1" value={fin.prices[t].br} onChange={(e) => setPx(t, "br", e.target.value)}
                        style={{ width: "100%", fontSize: 17, padding: "10px 12px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }} />
                    </div>
                    <div>
                      <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>US$ / mo (exterior)</label>
                      <input type="number" min="1" value={fin.prices[t].intl} onChange={(e) => setPx(t, "intl", e.target.value)}
                        style={{ width: "100%", fontSize: 17, padding: "10px 12px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }} />
                    </div>
                  </div>
                ))}
                <div style={{ background: C.card, borderRadius: 12, padding: 12, margin: "12px 0" }}>
                  <p style={{ fontWeight: 800 }}>Curso Avulso (automático — 5× Master)</p>
                  <p style={{ color: C.orange, fontWeight: 800, fontSize: 18 }}>
                    R$ {(parseInt(fin.prices.master.br, 10) || 0) * 5} · US$ {(parseInt(fin.prices.master.intl, 10) || 0) * 5}
                  </p>
                  <p style={{ color: C.muted, fontSize: 13.5 }}>6 meses de treino + apostila para sempre. Créditos: pacote de 500 pontos.</p>
                </div>
                <button onClick={savePrices}
                  style={{ ...btn, background: C.buy, color: "#06220F", padding: "14px 26px" }}>
                  💾 Publicar preços no site
                </button>
                {fin.msg && <p style={{ color: C.buy, fontWeight: 800, marginTop: 10 }}>{fin.msg}</p>}
              </div>
            )}
          </section>
        )}

        {section === "vip" && (
          <section style={{ background: C.surface, border: "1px solid " + C.grid, borderRadius: 18, padding: 20 }}>
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>🎁 Cortesias — acesso para parceiros</p>
            <p style={{ color: C.muted, fontSize: 14.5, marginBottom: 14 }}>
              Permuta de anúncio, imprensa, prêmios: o e-mail ganha o nível pelo prazo escolhido — mesmo antes de criar a conta. Revogar corta no próximo login.
            </p>
            {vip.err === "token" && <p style={{ color: C.orange, fontWeight: 700 }}>Abra o 📊 Dashboard e informe o token uma vez — as Cortesias usam a mesma chave.</p>}
            {vip.err && vip.err !== "token" && <p style={{ color: C.sell, fontWeight: 700 }}>Falha: {vip.err}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 10 }}>
              <div>
                <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>E-MAIL DO PARCEIRO</label>
                <input value={vip.email} onChange={(e) => setVip((v) => ({ ...v, email: e.target.value }))} placeholder="parceiro@exemplo.com"
                  style={{ width: "100%", fontSize: 17, padding: "11px 12px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }} />
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>NOTA (ex.: permuta anúncio Q3)</label>
                <input value={vip.note} onChange={(e) => setVip((v) => ({ ...v, note: e.target.value }))} placeholder="motivo/contrato"
                  style={{ width: "100%", fontSize: 17, padding: "11px 12px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 12 }}>
              <div>
                <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>NÍVEL</label>
                <select value={vip.tier} onChange={(e) => setVip((v) => ({ ...v, tier: e.target.value }))}
                  style={{ width: "100%", fontSize: 16, padding: "11px 10px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }}>
                  <option value="base">Base</option>
                  <option value="plus">Plus</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: 12.5, fontWeight: 800 }}>PRAZO</label>
                <select value={vip.days} onChange={(e) => setVip((v) => ({ ...v, days: parseInt(e.target.value, 10) }))}
                  style={{ width: "100%", fontSize: 16, padding: "11px 10px", borderRadius: 10, border: "2px solid " + C.grid, background: C.bg, color: C.text }}>
                  <option value={30}>30 dias</option>
                  <option value={90}>90 dias</option>
                  <option value={180}>180 dias</option>
                  <option value={365}>1 ano</option>
                  <option value={0}>Permanente</option>
                </select>
              </div>
              <div style={{ gridColumn: "span 2", display: "flex", alignItems: "end" }}>
                <button onClick={grantAccess} disabled={!vip.email.includes("@")}
                  style={{ ...btn, width: "100%", background: C.buy, color: "#06220F", padding: "12px 16px", opacity: vip.email.includes("@") ? 1 : 0.5 }}>
                  🎁 Conceder acesso
                </button>
              </div>
            </div>
            {vip.msg && <p style={{ color: C.buy, fontWeight: 800, marginBottom: 10 }}>{vip.msg}</p>}

            <p style={{ fontWeight: 800, fontSize: 16, margin: "8px 0" }}>Cortesias concedidas</p>
            {(!vip.list || vip.list.length === 0) && <p style={{ color: C.muted, fontSize: 14.5 }}>Nenhuma ainda — a primeira permuta aparece aqui.</p>}
            {(vip.list || []).map((g) => (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderBottom: "1px solid " + C.grid, padding: "8px 0", fontSize: 15 }}>
                <span>
                  <b>{g.email}</b> · <span style={{ color: C.orange, fontWeight: 800, textTransform: "capitalize" }}>{g.tier}</span>
                  <span style={{ color: C.muted }}> · {g.expires_at ? "até " + new Date(g.expires_at).toLocaleDateString() : "permanente"}{g.note ? " · " + g.note : ""}</span>
                </span>
                <button onClick={() => revokeGrant(g.id)}
                  style={{ background: "none", border: "1px solid " + C.sell, color: C.sell, borderRadius: 8, fontSize: 13, fontWeight: 800, padding: "5px 10px", cursor: "pointer" }}>
                  Revogar
                </button>
              </div>
            ))}
          </section>
        )}

        {section === "arch" && (
          <section>
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>⚙ Arquitetura do negócio</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["📊 Dashboard", "Mapa-múndi, online agora, pizza por nível, financeiro vivo.", "dash", true],
                ["📣 Marketing — Parceiro do Dojo", "Anúncio recompensado: mídia, público, créditos, teto.", "mkt", true],
                ["💰 Financeiro", "Tabela de preços vigente e regras comerciais.", "fin", true],
                ["🎁 Cortesias — parcerias", "Conceda Base/Plus/Master por e-mail: permuta de anúncio, imprensa, prêmios.", "vip", true],
                ["👥 Clientes & Segmentos", "As 6 listas de ciclo de vida com ação por segmento — chega com o Admin v2.1.", null, false],
                ["🎫 Reclamações", "Tickets do bot de ajuda com protocolo e status — na fila junto do help.", null, false],
                ["📚 Cursos & Avulsos", "Compras, certificados e relógios de 6 meses vencendo — liga na Fase 2B.", null, false],
                ["🔌 Integrações", "Supabase ✔ ativo · Stripe (2B) · Lojas iOS/Android (Fase 3) · MoR (2B).", null, false],
                ["🔐 Sistema", "Senha do painel: ADMIN_PASS no código · Token do dashboard: ADMIN_DASH_TOKEN na Vercel · service_role só no servidor.", null, false],
              ].map(([t, d, go, on]) => (
                <div key={t} onClick={() => go && setSection(go)}
                  style={{ background: C.surface, border: "1px solid " + (on ? C.orange : C.grid), borderRadius: 16, padding: 16, cursor: go ? "pointer" : "default", opacity: on ? 1 : 0.75 }}>
                  <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{t}</p>
                  <p style={{ color: C.muted, fontSize: 14.5 }}>{d}</p>
                  {!on && <p style={{ color: C.orange, fontWeight: 800, fontSize: 12.5, marginTop: 6 }}>EM CONSTRUÇÃO</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "mkt" && (
        <p style={{ color: C.muted, fontSize: 15.5, margin: "6px 0 18px" }}>
          Anúncio recompensado (Parceiro do Dojo). Nesta v1 a configuração vale neste navegador — a Fase 2 grava no Supabase e publica para todos os alunos. Plus e Master nunca veem anúncio.
        </p>
        )}

        {section === "mkt" && (
        <section style={{ background: C.surface, border: "1px solid " + C.grid, borderRadius: 18, padding: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 20 }}>Status do anúncio</span>
            <button onClick={() => set("enabled", !cfg.enabled)}
              style={{ ...btn, minHeight: 46, padding: "8px 18px", background: cfg.enabled ? C.buy : C.navy, color: cfg.enabled ? "#06220F" : "#fff" }}>
              {cfg.enabled ? "✔ ATIVO" : "○ Desativado"}
            </button>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Nome do parceiro (aparece no player)</label>
            <input style={input} value={cfg.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Ex.: Corretora Exemplo" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
            <div>
              <label style={label}>Tipo de mídia</label>
              <div className="flex gap-2">
                {["image", "video"].map((t) => (
                  <button key={t} onClick={() => set("mediaType", t)}
                    style={{ ...btn, flex: 1, minHeight: 48, background: cfg.mediaType === t ? C.orange : C.navy, color: cfg.mediaType === t ? "#231000" : "#fff" }}>
                    {t === "image" ? "🖼 Imagem" : "🎥 Vídeo"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={label}>Duração (segundos)</label>
              <input type="number" min="5" max="120" style={input} value={cfg.durationS}
                onChange={(e) => set("durationS", Math.max(5, Math.min(120, parseInt(e.target.value || "30", 10))))} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>URL da mídia (arquivo em /public ou link externo)</label>
            <input style={input} value={cfg.mediaUrl} onChange={(e) => set("mediaUrl", e.target.value)} placeholder="/parceiro-placeholder.png" />
            <p style={{ color: C.muted, fontSize: 14.5, marginTop: 6 }}>
              Dica: coloque o arquivo na pasta <b>public/</b> do projeto (ex.: public/parceiro.mp4) e use "/parceiro.mp4" — o git push publica junto.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Link do parceiro (opcional)</label>
            <input style={input} value={cfg.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://parceiro.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: 14 }}>
            <div>
              <label style={label}>Créditos por visualização</label>
              <input type="number" min="1" max="200" style={input} value={cfg.rewardPoints}
                onChange={(e) => set("rewardPoints", Math.max(1, Math.min(200, parseInt(e.target.value || "20", 10))))} />
            </div>
            <div>
              <label style={label}>Teto diário por aluno</label>
              <input type="number" min="1" max="20" style={input} value={cfg.dailyCap}
                onChange={(e) => set("dailyCap", Math.max(1, Math.min(20, parseInt(e.target.value || "3", 10))))} />
            </div>
            <div>
              <label style={label}>Público que vê</label>
              <div className="flex gap-2">
                {[["free", "Grátis"], ["base", "Base"]].map(([id, nm]) => {
                  const on = cfg.audience.includes(id);
                  return (
                    <button key={id} onClick={() => toggleAud(id)}
                      style={{ ...btn, flex: 1, minHeight: 48, background: on ? "rgba(34,197,94,0.16)" : C.navy, border: "2px solid " + (on ? C.buy : C.grid), color: C.text }}>
                      {on ? "✓ " : "○ "}{nm}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3" style={{ marginTop: 6 }}>
            <button onClick={save} style={{ ...btn, background: C.buy, color: "#06220F", padding: "12px 24px" }}>
              💾 Salvar configuração
            </button>
            <button onClick={() => setPreview(true)} style={{ ...btn, background: C.navy, color: "#fff", padding: "12px 24px" }}>
              ▶ Pré-visualizar
            </button>
            {saved && <span style={{ color: C.buy, fontWeight: 800, alignSelf: "center" }}>✔ Salvo</span>}
          </div>
        </section>
        )}

        {section === "mkt" && (
        <p style={{ color: C.muted, fontSize: 14.5, marginTop: 16 }}>
          Regras da casa: anúncio só para Grátis/Base (Plus e Master compram silêncio), sempre recompensado e com teto diário — o dojo não vira fazenda de propaganda. Parceiros curados por você, um a um.
        </p>
        )}
      </div>

      {preview && (
        <div role="dialog" style={{ position: "fixed", inset: 0, background: "rgba(6,7,24,0.92)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.surface, border: "2px solid " + C.orange, borderRadius: 18, maxWidth: 560, width: "100%", padding: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ color: C.orange, fontWeight: 800 }}>🎬 Parceiro do Dojo{cfg.headline ? " · " + cfg.headline : ""}</span>
              <span style={{ fontWeight: 800, fontSize: 20 }}>{left}s</span>
            </div>
            {cfg.mediaType === "video" ? (
              <video src={cfg.mediaUrl} autoPlay muted playsInline style={{ width: "100%", borderRadius: 12, background: "#000" }} />
            ) : (
              <img src={cfg.mediaUrl} alt="preview" style={{ width: "100%", borderRadius: 12 }} />
            )}
            <div style={{ background: C.card, height: 12, borderRadius: 8, marginTop: 12 }}>
              <div style={{ width: (((cfg.durationS || 30) - left) / (cfg.durationS || 30)) * 100 + "%", height: "100%", background: C.orange, borderRadius: 8, transition: "width 1s linear" }} />
            </div>
            <p style={{ color: left === 0 ? C.buy : C.muted, fontWeight: 700, marginTop: 10 }}>
              {left === 0 ? "✔ Aqui o aluno recebe +" + cfg.rewardPoints + " pontos" : "Simulando a visão do aluno…"}
            </p>
            <button onClick={() => setPreview(false)}
              style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 12, marginTop: 10 }}>
              Fechar pré-visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
