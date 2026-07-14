"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const HUB = { bg: "#12143A", surface: "#1B1E52", orange: "#F47B20", text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F", navy: "#2D3278" };

const LANG_NAMES = { pt: "Português", en: "English", es: "Español" };

const HL = {
  pt: {
    slogan: "Treine o olho. Leia o mercado.",
    how: "\ud83e\udd4b Como funciona o dojo",
    back: "\u2190 In\u00edcio",
    guide: [
      { t: "O objetivo", d: "Treinar o olho para ler qual força domina o mercado — compradores ou vendedores — antes de arriscar dinheiro de verdade. Aqui você não opera: você aprende a leitura que vem antes de qualquer operação." },
      { t: "A jogada", d: "Cada cenário mostra o gráfico (preço, volume e delta) e a descrição do tape. Você responde com um dos três botões: ▲ FORÇA COMPRADORA, ▼ FORÇA VENDEDORA ou ◼ SEM LEITURA CLARA — porque não operar também é leitura. Acerte ou erre, o app explica o raciocínio completo." },
      { t: "Os pontos", d: "Você começa com 1.000 pontos, renovados todo mês. Abrir um pregão custa 10; leitura correta devolve 5; cinco acertos seguidos dão um pregão grátis. Quem lê melhor, treina mais com os mesmos pontos." },
      { t: "As fases", d: "Acertos sobem sua faixa: Branca → Amarela → Laranja → Verde → Azul → Marrom → Preta. Com 70%+ em todos os fundamentos você se gradua — e o caminho segue na Arena LIVE, em três níveis (Intermediário Avançado → Avançado → Eficiente), com mais ruído e janelas de decisão cada vez menores." },
    ],
    cards: [
      { id: "treinar", tag: "DOJO", title: "Treinador de Fluxo", plan: "Todos os planos", desc: "Drills dos 6 fundamentos com explicação, pontos, faixas, relatório e estudo dirigido. PT · EN · ES." },
      { id: "live", tag: "MASTER", title: "Arena LIVE", plan: "Plano Master", desc: "Mercado sintético em tempo real: leia o regime se formando e decida na janela. Três níveis." },
      { id: "wilder", tag: "SÉRIE MESTRES · VOL. 1", title: "Dojo Wilder", plan: "Incluso no Master · ou avulso", desc: "RSI, ATR, ADX e Parabolic SAR de verdade — Modo Estudo ou Modo Pregão, com exame e certificado." },
    ],
    trial: "🎁 Teste grátis: 7 dias com acesso total a tudo, sem cartão. Depois, cada área pertence ao seu plano.",
    plansTitle: "Planos",
    plans: [
      { name: "Base", pid: "base", desc: "1.000 pontos/mês · Treinador completo, relatório de erros e estudo dirigido." },
      { name: "Plus", pid: "plus", badge: "Mais popular", desc: "3.000 pontos/mês · para quem treina todos os dias." },
      { name: "Master", pid: "master", desc: "10.000 pontos + regeneração · Arena LIVE (níveis 4–6) · cursos Wyckoff, Steidlmayer e Granville · 1 Sessão Sensei/mês." },
    ],
    cta: "🥋 Começar os 7 dias grátis",
    plansNote: "O pagamento destrava a porta; o exame destrava a sala: nível não se compra.",
    settings: "Configurações", settingsLang: "Idioma", accountTitle: "Conta",
    accEmail: "E-mail", accPhone: "Telefone", accPass: "Senha",
    accountSoon: "E-mail, telefone e senha são ativados com as contas na nuvem (em breve). Hoje seu progresso vive neste aparelho.",
    close: "Fechar",
    note: "Plataforma educacional com cenários sintéticos — não são dados reais de mercado nem recomendação de investimento.",
  },
  en: {
    slogan: "Train the eye. Read the market.",
    how: "\ud83e\udd4b How the dojo works",
    back: "\u2190 Home",
    guide: [
      { t: "The goal", d: "Train your eye to read which force dominates the market — buyers or sellers — before risking real money. You do not trade here: you learn the reading that comes before any trade." },
      { t: "The play", d: "Each scenario shows the chart (price, volume and delta) plus the tape description. You answer with one of three buttons: ▲ BUYING FORCE, ▼ SELLING FORCE or ◼ NO CLEAR READ — because standing aside is also a read. Right or wrong, the app explains the full reasoning." },
      { t: "The points", d: "You start with 1,000 points, renewed every month. Opening a session costs 10; a correct read refunds 5; five in a row earn a free session. The better you read, the more you train with the same points." },
      { t: "The stages", d: "Correct reads raise your belt: White → Yellow → Orange → Green → Blue → Brown → Black. With 70%+ on every fundamental you graduate — and the path continues in the LIVE Arena, across three levels (Upper Intermediate → Advanced → Proficient), with more noise and shrinking decision windows." },
    ],
    cards: [
      { id: "treinar", tag: "DOJO", title: "Flow Trainer", plan: "All plans", desc: "Drills on the 6 fundamentals with full reasoning, points, belts, report and guided study. PT · EN · ES." },
      { id: "live", tag: "MASTER", title: "LIVE Arena", plan: "Master plan", desc: "Synthetic market in real time: read the regime as it forms and decide inside the window. Three levels." },
      { id: "wilder", tag: "MASTERS SERIES · VOL. 1", title: "Wilder Dojo", plan: "Included in Master · or standalone", desc: "Real RSI, ATR, ADX and Parabolic SAR — Study Mode or Session Mode, with exam and certificate. (Prototype in PT)" },
    ],
    trial: "🎁 Free trial: 7 days with full access to everything, no card. After that, each area belongs to your plan.",
    plansTitle: "Plans",
    plans: [
      { name: "Base", pid: "base", desc: "1,000 points/month · full Trainer, mistake report and guided study." },
      { name: "Plus", pid: "plus", badge: "Most popular", desc: "3,000 points/month · for those who train every day." },
      { name: "Master", pid: "master", desc: "10,000 points + regeneration · LIVE Arena (levels 4–6) · Wyckoff, Steidlmayer & Granville courses · 1 Sensei Session/month." },
    ],
    cta: "🥋 Start the 7-day free trial",
    plansNote: "Payment unlocks the door; the exam unlocks the room: levels can't be bought.",
    settings: "Settings", settingsLang: "Language", accountTitle: "Account",
    accEmail: "Email", accPhone: "Phone", accPass: "Password",
    accountSoon: "Email, phone and password activate with cloud accounts (coming soon). Today your progress lives on this device.",
    close: "Close",
    note: "Educational platform with synthetic scenarios — not real market data and not investment advice.",
  },
  es: {
    slogan: "Entrena el ojo. Lee el mercado.",
    how: "\ud83e\udd4b Cómo funciona el dojo",
    back: "\u2190 Inicio",
    guide: [
      { t: "El objetivo", d: "Entrenar el ojo para leer qué fuerza domina el mercado — compradores o vendedores — antes de arriesgar dinero real. Aquí no operas: aprendes la lectura que viene antes de cualquier operación." },
      { t: "La jugada", d: "Cada escenario muestra el gráfico (precio, volumen y delta) y la descripción del tape. Respondes con uno de tres botones: ▲ FUERZA COMPRADORA, ▼ FUERZA VENDEDORA o ◼ SIN LECTURA CLARA — porque no operar también es una lectura. Aciertes o falles, la app explica el razonamiento completo." },
      { t: "Los puntos", d: "Empiezas con 1.000 puntos, renovados cada mes. Abrir una sesión cuesta 10; una lectura correcta devuelve 5; cinco aciertos seguidos dan una sesión gratis. Quien lee mejor, entrena más con los mismos puntos." },
      { t: "Las fases", d: "Los aciertos suben tu cinturón: Blanco → Amarillo → Naranja → Verde → Azul → Marrón → Negro. Con 70%+ en todos los fundamentos te gradúas — y el camino sigue en la Arena LIVE, en tres niveles (Intermedio Avanzado → Avanzado → Eficiente), con más ruido y ventanas de decisión cada vez menores." },
    ],
    cards: [
      { id: "treinar", tag: "DOJO", title: "Entrenador de Flujo", plan: "Todos los planes", desc: "Drills de los 6 fundamentos con razonamiento completo, puntos, cinturones, informe y estudio dirigido. PT · EN · ES." },
      { id: "live", tag: "MASTER", title: "Arena LIVE", plan: "Plan Master", desc: "Mercado sintético en tiempo real: lee el régimen mientras se forma y decide dentro de la ventana. Tres niveles." },
      { id: "wilder", tag: "SERIE MAESTROS · VOL. 1", title: "Dojo Wilder", plan: "Incluido en Master · o suelto", desc: "RSI, ATR, ADX y Parabolic SAR de verdad — Modo Estudio o Modo Sesión, con examen y certificado. (Prototipo en PT)" },
    ],
    trial: "🎁 Prueba gratis: 7 días con acceso total a todo, sin tarjeta. Después, cada área pertenece a tu plan.",
    plansTitle: "Planes",
    plans: [
      { name: "Base", pid: "base", desc: "1.000 puntos/mes · Entrenador completo, informe de errores y estudio dirigido." },
      { name: "Plus", pid: "plus", badge: "Más popular", desc: "3.000 puntos/mes · para quien entrena todos los días." },
      { name: "Master", pid: "master", desc: "10.000 puntos + regeneración · Arena LIVE (niveles 4–6) · cursos Wyckoff, Steidlmayer y Granville · 1 Sesión Sensei/mes." },
    ],
    cta: "🥋 Empezar los 7 días gratis",
    plansNote: "El pago abre la puerta; el examen abre la sala: el nivel no se compra.",
    settings: "Configuración", settingsLang: "Idioma", accountTitle: "Cuenta",
    accEmail: "Correo", accPhone: "Teléfono", accPass: "Contraseña",
    accountSoon: "Correo, teléfono y contraseña se activan con las cuentas en la nube (muy pronto). Hoy tu progreso vive en este dispositivo.",
    close: "Cerrar",
    note: "Plataforma educativa con escenarios sintéticos — no son datos reales de mercado ni recomendación de inversión.",
  },
};


const ROUTES = { treinar: "/treinar", live: "/live", wilder: "/mestres/wilder" };

// vitrine de preços por geografia (cookie td-country, gravado pelo middleware na borda)
const PLAN_AMOUNT = {
  br: { base: "R$ 47", plus: "R$ 87", master: "R$ 197" },
  intl: { base: "US$ 19", plus: "US$ 39", master: "US$ 89" },
};
const PLAN_SUFFIX = { pt: "/mês", en: "/mo", es: "/mes" };
function geoCountry() {
  try {
    const m = document.cookie.match(/(?:^|; )td-country=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  } catch (e) { return ""; }
}

function ToriiHome({ size = 116 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill={HUB.bg} />
      <path d="M 76 172 C 168 132, 344 132, 436 172" fill="none" stroke={HUB.orange} strokeWidth="42" strokeLinecap="round" />
      <rect x="132" y="192" width="248" height="26" rx="10" fill={HUB.orange} />
      <rect x="122" y="262" width="268" height="22" rx="9" fill={HUB.orange} />
      <rect x="150" y="192" width="42" height="230" rx="12" fill={HUB.orange} />
      <rect x="320" y="192" width="42" height="230" rx="12" fill={HUB.orange} />
      <g stroke="#F5F6FF" strokeWidth="6" strokeLinecap="round">
        <line x1="224" y1="342" x2="224" y2="412" /><line x1="256" y1="316" x2="256" y2="400" /><line x1="288" y1="292" x2="288" y2="384" />
      </g>
      <g fill="#F5F6FF">
        <rect x="212" y="356" width="24" height="38" rx="5" /><rect x="244" y="330" width="24" height="42" rx="5" /><rect x="276" y="304" width="24" height="46" rx="5" />
      </g>
    </svg>
  );
}

function HowItWorks({ T }) {
  const [open, setOpen] = useState(true);
  return (
    <section style={{ background: HUB.surface, border: "1px solid " + HUB.grid, borderRadius: 18, padding: "16px 20px", marginBottom: 18 }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", color: HUB.text, fontWeight: 800, fontSize: 21, cursor: "pointer", padding: 0, width: "100%", textAlign: "left", minHeight: 44 }}>
        {T.how} <span style={{ color: HUB.orange }}>{open ? "\u25b2" : "\u25bc"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          {T.guide.map((g, i) => (
            <p key={i} style={{ marginBottom: 10, fontSize: 17.5 }}>
              <span style={{ color: HUB.orange, fontWeight: 800 }}>{i + 1}. {g.t} — </span>
              <span style={{ color: HUB.muted }}>{g.d}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [lang, setLang] = useState("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [geo, setGeo] = useState("");
  const T = HL[lang];
  const isBR = geo === "BR";
  const priceOf = (pid) => (isBR ? PLAN_AMOUNT.br : PLAN_AMOUNT.intl)[pid] + (PLAN_SUFFIX[lang] || "/mo");

  useEffect(() => {
    try {
      const v = localStorage.getItem("td:lang");
      if (v) { const k = JSON.parse(v); if (HL[k]) setLang(k); }
    } catch (e) { /* primeira visita */ }
    setGeo(geoCountry());
  }, []);

  function changeLang(v) {
    setLang(v);
    try { localStorage.setItem("td:lang", JSON.stringify(v)); } catch (e) { /* memoria */ }
  }

  return (
    <main style={{ background: HUB.bg, minHeight: "100vh", color: HUB.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="flex items-center justify-end gap-2" style={{ marginBottom: 8 }}>
          <select aria-label="Language" value={lang} onChange={(e) => changeLang(e.target.value)}
            style={{ background: HUB.navy, color: "#fff", border: "1px solid " + HUB.grid, borderRadius: 10, fontWeight: 800, fontSize: 15, padding: "10px 12px", minHeight: 44, cursor: "pointer" }}>
            {Object.keys(HL).map((k) => (
              <option key={k} value={k}>{LANG_NAMES[k]}</option>
            ))}
          </select>
          <button onClick={() => setSettingsOpen(true)} aria-label={T.settings} title={T.settings}
            style={{ background: HUB.navy, color: "#fff", border: "1px solid " + HUB.grid, borderRadius: 10, fontSize: 20, minHeight: 44, minWidth: 46, cursor: "pointer" }}>
            ⚙
          </button>
        </div>
        <div className="flex flex-col items-center text-center mb-6">
          <ToriiHome />
          <h1 style={{ fontSize: 42, fontWeight: 800, marginTop: 8 }}>
            Tape<span style={{ color: HUB.orange }}>Dojo</span>
          </h1>
          <p style={{ color: HUB.orange, fontSize: 21, fontWeight: 700 }}>{T.slogan}</p>
          <p style={{ background: "rgba(244,123,32,0.12)", border: "1px solid " + HUB.orange, color: HUB.text, borderRadius: 12, padding: "10px 16px", fontSize: 16.5, fontWeight: 700, marginTop: 12, maxWidth: 560 }}>{T.trial}</p>

        </div>

        <HowItWorks T={T} />

        <div className="grid grid-cols-1 gap-4">
          {T.cards.map((c) => (
            <Link key={c.id} href={ROUTES[c.id]} style={{ textDecoration: "none" }}>
              <div style={{ background: HUB.surface, border: "1px solid " + HUB.grid, borderRadius: 18, padding: 20, minHeight: 96 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4, gap: 8, flexWrap: "wrap" }}>
                  <p style={{ color: HUB.orange, fontWeight: 800, fontSize: 14.5, letterSpacing: "0.08em" }}>{c.tag}</p>
                  <p style={{ color: HUB.muted, fontWeight: 700, fontSize: 13.5, border: "1px solid " + HUB.grid, borderRadius: 999, padding: "2px 10px" }}>{c.plan}</p>
                </div>
                <p style={{ color: HUB.text, fontWeight: 800, fontSize: 23, marginBottom: 6 }}>{c.title} →</p>
                <p style={{ color: HUB.muted, fontSize: 17.5 }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <section style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 27, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>{T.plansTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ alignItems: "stretch" }}>
            {T.plans.map((pl) => (
              <div key={pl.name} style={{ background: HUB.surface, border: "2px solid " + (pl.badge ? HUB.orange : HUB.grid), borderRadius: 18, padding: 18, position: "relative" }}>
                {pl.badge && (
                  <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: HUB.orange, color: "#231000", fontWeight: 800, fontSize: 13, borderRadius: 999, padding: "3px 12px", whiteSpace: "nowrap" }}>{pl.badge}</span>
                )}
                <p style={{ fontWeight: 800, fontSize: 21 }}>{pl.name}</p>
                <p style={{ color: HUB.orange, fontWeight: 800, fontSize: 24, margin: "2px 0 8px" }}>{priceOf(pl.pid)}</p>
                <p style={{ color: HUB.muted, fontSize: 15.5 }}>{pl.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/treinar" style={{ textDecoration: "none" }}>
            <p style={{ background: HUB.orange, color: "#231000", fontWeight: 800, fontSize: 19, textAlign: "center", borderRadius: 14, padding: "16px 20px", marginTop: 16, cursor: "pointer" }}>{T.cta}</p>
          </Link>
          <p style={{ color: HUB.muted, fontSize: 14.5, textAlign: "center", marginTop: 10 }}>{T.plansNote}</p>
        </section>

        <p style={{ color: HUB.muted, fontSize: 15.5, marginTop: 28, textAlign: "center" }}>{T.note}</p>
      </div>

      {settingsOpen && (
        <div role="dialog" aria-label={T.settings}
          style={{ position: "fixed", inset: 0, background: "rgba(6,7,24,0.9)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: HUB.surface, border: "2px solid " + HUB.grid, borderRadius: 18, maxWidth: 440, width: "100%", padding: 20 }}>
            <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 14 }}>⚙ {T.settings}</p>
            <p style={{ color: HUB.muted, fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{T.settingsLang}</p>
            <select value={lang} onChange={(e) => changeLang(e.target.value)}
              style={{ width: "100%", background: HUB.navy, color: "#fff", border: "1px solid " + HUB.grid, borderRadius: 10, fontWeight: 800, fontSize: 16, padding: "12px", marginBottom: 18 }}>
              {Object.keys(HL).map((k) => (
                <option key={k} value={k}>{LANG_NAMES[k]}</option>
              ))}
            </select>
            <p style={{ color: HUB.muted, fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{T.accountTitle}</p>
            {[T.accEmail, T.accPhone, T.accPass].map((f) => (
              <div key={f} style={{ marginBottom: 8 }}>
                <input disabled placeholder={"🔒 " + f}
                  style={{ width: "100%", background: HUB.bg, color: HUB.muted, border: "1px dashed " + HUB.grid, borderRadius: 10, fontSize: 15.5, padding: "11px 12px" }} />
              </div>
            ))}
            <p style={{ color: HUB.muted, fontSize: 14.5, marginBottom: 14 }}>{T.accountSoon}</p>
            <button onClick={() => setSettingsOpen(false)}
              style={{ width: "100%", background: HUB.orange, color: "#231000", fontWeight: 800, fontSize: 17, border: "none", borderRadius: 12, padding: 14, cursor: "pointer", minHeight: 50 }}>
              {T.close}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
