"use client";
import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";

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
          {[["dash", "📊 Dashboard"], ["mkt", "📣 Marketing"], ["fin", "💰 Financeiro"]].map(([id, nm]) => (
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
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>💰 Financeiro — tabela vigente</p>
            {[
              ["Base", "R$ 47/mês · US$ 19/mo", "1.000 pontos/mês"],
              ["Plus", "R$ 87/mês · US$ 39/mo", "3.000 pontos/mês — a âncora"],
              ["Master", "R$ 197/mês · US$ 89/mo", "10.000 pts + regeneração · Arena · 4 cursos · 1 Sensei/mês"],
              ["Curso Avulso", "R$ 985 · US$ 445 (5× Master)", "6 meses de treino + apostila para sempre"],
              ["Créditos", "pacote de 500 pontos", "micro-transação"],
            ].map(([n, v, d]) => (
              <div key={n} style={{ borderBottom: "1px solid " + C.grid, padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontWeight: 800 }}>{n}</span>
                  <span style={{ color: C.orange, fontWeight: 800, textAlign: "right" }}>{v}</span>
                </div>
                <p style={{ color: C.muted, fontSize: 14.5 }}>{d}</p>
              </div>
            ))}
            <p style={{ color: C.muted, fontSize: 14, marginTop: 12 }}>
              Números vivos (MRR, feito, a receber) estão no 📊 Dashboard. Preços regionais cobrados pelo país do cartão via MoR — Fase 2B. Alterar preço = editar PLAN_AMOUNT no código + esta tabela.
            </p>
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
