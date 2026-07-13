"use client";

import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// TAPEDOJO LIVE — protótipo do motor de mercado ao vivo (Master)
// Mercado sintético em tempo real: ticks chegam, candles se formam,
// delta pulsa. Um regime de fluxo oculto se desenvolve na tela e o
// aluno precisa lê-lo dentro de uma janela de decisão cronometrada.
// Protótipo em PT — na produção, funde com o sistema i18n da v2.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278",
  orange: "#F47B20", buy: "#22C55E", sell: "#F05252",
  text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F",
};

const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.round(rnd(a, b));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

const TICKS_PER_CANDLE = 12;
const VISIBLE = 16;

// ── Níveis de dificuldade (degraus Master) ──
const LEVELS = {
  n4: { name: "Intermediário Avançado", tickMs: 260, windowSec: 14, noise: 1.0, contrast: 1.0, mistosProb: 0.15 },
  n5: { name: "Avançado", tickMs: 220, windowSec: 10, noise: 1.35, contrast: 0.8, mistosProb: 0.25 },
  n6: { name: "Eficiente", tickMs: 180, windowSec: 7, noise: 1.7, contrast: 0.65, mistosProb: 0.35 },
};

// ── Roteiros de regime (fases; dir=1 espelhável) ──
// drift: deslocamento médio por tick · vol: intensidade média por tick
// bias: viés de agressão (-1 só venda … +1 só compra) · win: abre janela
function buildScript(type, dir, lv) {
  const N = lv.noise, K = lv.contrast;
  const vol = (base, special) => base + (special - base) * K; // contraste menor = mais sutil
  if (type === "absorcao") {
    return [
      { c: rndi(5, 7), drift: -0.045 * dir, noise: 0.028 * N, vol: 3, bias: -0.35 * dir },
      { c: rndi(2, 3), drift: 0, noise: 0.014 * N, vol: vol(3, 9.5), bias: -0.6 * dir, floor: true, win: true },
      { c: 3, drift: 0.06 * dir, noise: 0.024 * N, vol: 5, bias: 0.5 * dir },
    ];
  }
  if (type === "divergencia") {
    return [
      { c: 3, drift: 0.05 * dir, noise: 0.024 * N, vol: 5, bias: 0.5 * dir },
      { c: 3, drift: 0.035 * dir, noise: 0.024 * N, vol: 4, bias: 0.22 * dir },
      { c: rndi(2, 3), drift: 0.02 * dir, noise: 0.022 * N, vol: 3.5, bias: -0.15 * dir, win: true },
      { c: 3, drift: -0.06 * dir, noise: 0.026 * N, vol: 5, bias: -0.5 * dir },
    ];
  }
  if (type === "iniciativa") {
    return [
      { c: rndi(5, 7), drift: 0, noise: 0.02 * N, vol: 2.6, bias: 0 },
      { c: 2, drift: 0.09 * dir, noise: 0.022 * N, vol: vol(2.6, 8.5), bias: 0.65 * dir, win: true },
      { c: 3, drift: 0.05 * dir, noise: 0.024 * N, vol: 5, bias: 0.4 * dir },
    ];
  }
  if (type === "exaustao") {
    return [
      { c: rndi(5, 6), drift: 0.05 * dir, noise: 0.022 * N, vol: 4.2, bias: 0.45 * dir },
      { c: 1, drift: 0.14 * dir, noise: 0.03 * N, vol: vol(4.2, 12), bias: 0.7 * dir, win: true },
      { c: 1, drift: -0.12 * dir, noise: 0.03 * N, vol: vol(4.2, 10), bias: 0.3 * dir },
      { c: 3, drift: -0.06 * dir, noise: 0.026 * N, vol: 5, bias: -0.5 * dir },
    ];
  }
  if (type === "pullback") {
    return [
      { c: 5, drift: 0.055 * dir, noise: 0.022 * N, vol: 5, bias: 0.5 * dir },
      { c: 3, drift: -0.025 * dir, noise: 0.016 * N, vol: vol(5, 1.6), bias: -0.12 * dir, win: true },
      { c: 3, drift: 0.055 * dir, noise: 0.022 * N, vol: 4.5, bias: 0.45 * dir },
    ];
  }
  // mistos
  const d1 = pick([1, -1]);
  return [
    { c: 3, drift: 0.03 * d1, noise: 0.03 * N, vol: 4, bias: 0.3 * d1 },
    { c: 3, drift: 0.025 * -d1, noise: 0.03 * N, vol: 6, bias: 0.3 * d1, win: true }, // preço vai contra o delta
    { c: 3, drift: 0.02 * d1, noise: 0.032 * N, vol: 4.5, bias: -0.25 * d1 },
  ];
}

const TYPES = ["absorcao", "divergencia", "iniciativa", "exaustao", "pullback"];

function answerOf(type, dir) {
  if (type === "mistos") return "none";
  if (type === "absorcao") return dir === 1 ? "buy" : "sell"; // dir=1: fundo defendido
  if (type === "divergencia") return dir === 1 ? "sell" : "buy"; // dir=1: topos perdendo força
  if (type === "exaustao") return dir === 1 ? "sell" : "buy";
  return dir === 1 ? "buy" : "sell"; // iniciativa, pullback
}

const NAMES = {
  absorcao: "Absorção em extremo", divergencia: "Divergência de delta",
  iniciativa: "Iniciativa (rompimento)", exaustao: "Exaustão climática",
  pullback: "Pullback em tendência", mistos: "Sinais conflitantes",
};

const EXPLAIN = {
  absorcao: (a) => a === "buy"
    ? "Enquanto você assistia: o preço parou de cair mesmo com o delta despencando e o volume explodindo — vendedores agredindo com força total e o nível segurando. Absorção compradora; a resolução veio para cima quando a agressão se esgotou."
    : "Enquanto você assistia: o preço parou de subir mesmo com o delta disparando e o volume explodindo — compradores agredindo com força total e o nível segurando. Absorção vendedora; a resolução veio para baixo.",
  divergencia: (a) => a === "sell"
    ? "As pernas de alta foram ficando mais lentas e o delta encolheu até virar negativo na última — avanço sem combustível. A resolução confirmou: sem agressão compradora real, o mercado cedeu."
    : "As pernas de queda foram perdendo agressão e o delta virou positivo na última — queda sem combustível. A resolução confirmou a virada para cima.",
  iniciativa: (a) => a === "buy"
    ? "Depois do range parado, o rompimento veio com volume e delta explodindo juntos — agressão real consumindo o book. Esforço com resultado: continuação compradora."
    : "Depois do range parado, o rompimento para baixo veio com volume e delta desabando juntos — agressão real consumindo o book de compra. Continuação vendedora.",
  exaustao: (a) => a === "sell"
    ? "O clímax: volume recorde, delta comprador no talo — e o preço esticou e devolveu tudo na sua frente. Esforço máximo, resultado zero: o último comprador entrou ali. A resolução foi a virada vendedora."
    : "O clímax: volume recorde, delta vendedor no talo — e o preço esticou para baixo e devolveu tudo. Capitulação: o último vendedor saiu ali. A resolução foi a virada compradora.",
  pullback: (a) => a === "buy"
    ? "O recuo veio raso, com o volume secando na sua frente e delta quase nulo — falta de comprador momentâneo, não venda institucional. A tendência retomou, como a leitura de fluxo indicava."
    : "O repique veio raso, com volume secando e delta quase nulo — recompra de vendidos, não compra nova. A queda retomou, como a leitura indicava.",
  mistos: () => "O delta apontava para um lado e o preço andava para o outro, sem nível defendido nem sequência de agressão. Não havia leitura — e o mercado seguiu picotado. Ficar de fora ERA a resposta profissional.",
};

const TIMEOUT_MSG = "No pregão, não decidir também é uma decisão — a janela fechou sem leitura. Nos níveis Master, hesitar custa pontos exatamente porque no mercado real custa dinheiro.";

// ═══════════════════ COMPONENTE ═══════════════════
export default function App() {
  const [levelKey, setLevelKey] = useState("n4");
  const [status, setStatus] = useState("idle"); // idle | running | window | resolving | done
  const [candles, setCandles] = useState([]);
  const [forming, setForming] = useState(null);
  const [windowLeft, setWindowLeft] = useState(0);
  const [verdict, setVerdict] = useState(null); // {ok, answer, chosen, type, timeout}
  const [stats, setStats] = useState({ total: 0, correct: 0, streak: 0, best: 0 });
  const eng = useRef(null);
  const timer = useRef(null);

  const lv = LEVELS[levelKey];

  function startSession() {
    clearInterval(timer.current);
    const useMistos = Math.random() < lv.mistosProb;
    const type = useMistos ? "mistos" : pick(TYPES);
    const dir = pick([1, -1]);
    const script = buildScript(type, dir, lv);
    eng.current = {
      type, dir, script,
      phase: 0, tickInPhase: 0, ticksThisCandle: 0,
      price: 1000, floorLevel: null,
      candles: [], cur: newCandle(1000),
      windowTicks: 0, windowTotal: Math.round((lv.windowSec * 1000) / lv.tickMs),
      windowOpen: false, chosen: null, resolved: false,
    };
    setCandles([]); setForming(eng.current.cur);
    setVerdict(null); setWindowLeft(0);
    setStatus("running");
    timer.current = setInterval(tick, lv.tickMs);
  }

  function newCandle(p) { return { o: p, h: p, l: p, c: p, vol: 0, delta: 0 }; }

  function tick() {
    const e = eng.current;
    if (!e) return;
    const ph = e.script[e.phase];

    // preço
    let dp = ph.drift + gauss() * ph.noise;
    e.price += dp;
    if (ph.floor) {
      if (e.floorLevel === null) e.floorLevel = e.price;
      // nível defendido: não cede além de um fio
      if (e.dir === 1 && e.price < e.floorLevel - 0.06) e.price = e.floorLevel - rnd(0, 0.06);
      if (e.dir === -1 && e.price > e.floorLevel + 0.06) e.price = e.floorLevel + rnd(0, 0.06);
    }

    // agressão
    const size = Math.max(1, Math.round(ph.vol * (0.6 + Math.random())));
    const buySide = Math.random() < 0.5 + ph.bias / 2;

    // candle em formação
    const k = e.cur;
    k.c = e.price;
    k.h = Math.max(k.h, e.price);
    k.l = Math.min(k.l, e.price);
    k.vol += size;
    k.delta += buySide ? size : -size;

    e.ticksThisCandle++;
    e.tickInPhase++;

    // janela de leitura
    if (ph.win && !e.windowOpen && !e.chosen) {
      e.windowOpen = true;
      setStatus("window");
    }
    if (e.windowOpen && !e.chosen) {
      e.windowTicks++;
      setWindowLeft(Math.max(0, e.windowTotal - e.windowTicks));
      if (e.windowTicks >= e.windowTotal) {
        e.windowOpen = false;
        e.chosen = "timeout";
        setStatus("resolving");
      }
    }

    // fecha candle
    if (e.ticksThisCandle >= TICKS_PER_CANDLE) {
      e.candles.push({ ...k });
      e.cur = newCandle(e.price);
      e.ticksThisCandle = 0;
      // avança fase
      if (e.tickInPhase >= ph.c * TICKS_PER_CANDLE) {
        e.phase++;
        e.tickInPhase = 0;
        if (e.phase >= e.script.length) return finish();
        // se a janela fechou por fase (usuário não respondeu e win acabou sem timeout): mantém aberta até timeout
      }
    }

    setCandles([...e.candles]);
    setForming({ ...e.cur });
  }

  function respond(choice) {
    const e = eng.current;
    if (!e || e.chosen || !(status === "window" || status === "running")) return;
    if (!e.windowOpen) return; // só durante a janela
    e.chosen = choice;
    e.windowOpen = false;
    setStatus("resolving"); // mercado continua rodando até o fim do roteiro
  }

  function finish() {
    clearInterval(timer.current);
    const e = eng.current;
    const answer = answerOf(e.type, e.dir);
    const chosen = e.chosen === null ? "timeout" : e.chosen;
    const timeout = chosen === "timeout";
    const ok = !timeout && chosen === answer;
    setStats((s) => {
      const n = { total: s.total + 1, correct: s.correct + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0, best: s.best };
      n.best = Math.max(n.best, n.streak);
      return n;
    });
    setVerdict({ ok, answer, chosen, timeout, type: e.type });
    setStatus("done");
  }

  useEffect(() => () => clearInterval(timer.current), []);

  // ── render ──
  const all = forming ? [...candles, forming] : candles;
  const view = all.slice(-VISIBLE);
  const acc = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  const btn = { minHeight: 60, fontSize: 20, fontWeight: 800, borderRadius: 14, border: "none", cursor: "pointer" };
  const canAnswer = status === "window";

  const ansLabel = { buy: "Compradora", sell: "Vendedora", none: "Sem leitura", timeout: "— (tempo esgotado)" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
      <div className="max-w-3xl mx-auto px-4 py-5">

        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              Tape<span style={{ color: C.orange }}>Dojo</span> <span style={{ color: C.orange, fontWeight: 800, fontSize: 17, border: "2px solid " + C.orange, borderRadius: 999, padding: "2px 12px", marginLeft: 6, verticalAlign: "middle" }}>LIVE · Master</span>
            </div>
            <div style={{ color: C.muted, fontSize: 16 }}>Mercado sintético em tempo real — protótipo</div>
          </div>
          <div className="flex gap-2">
            {Object.keys(LEVELS).map((k) => (
              <button key={k} onClick={() => { if (status === "idle" || status === "done") setLevelKey(k); }}
                title={LEVELS[k].name}
                style={{ ...btn, minHeight: 54, fontSize: 17, padding: "8px 14px", background: levelKey === k ? C.orange : C.navy, color: "#fff", opacity: status === "running" || status === "window" || status === "resolving" ? 0.5 : 1 }}>
                {LEVELS[k].name.split(" ")[0]}{k === "n4" ? " Av." : ""}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          <Chip label="Acerto" value={acc + "%"} />
          <Chip label="Pregões" value={stats.total} />
          <Chip label="Sequência" value={stats.streak} highlight={stats.streak >= 3} />
          <Chip label="Recorde" value={stats.best} />
          <Chip label="Nível" value={lv.name} small />
        </div>

        {/* mercado */}
        <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 18, marginBottom: 14, position: "relative" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              mercado simulado · candles de {Math.round(TICKS_PER_CANDLE * lv.tickMs / 1000 * 10) / 10}s
            </span>
            {(status === "running" || status === "window" || status === "resolving") && (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.sell, fontWeight: 800, fontSize: 16 }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: C.sell, animation: "tdpulse 1s infinite" }} />AO VIVO
              </span>
            )}
          </div>

          {view.length > 0 ? <LiveChart candles={view} /> : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
              Pressione iniciar para abrir o pregão
            </div>
          )}

          {status === "window" && (
            <div style={{ marginTop: 12 }}>
              <div className="flex justify-between" style={{ fontWeight: 800, color: C.orange, marginBottom: 6 }}>
                <span>⏱ Janela de leitura aberta — decida</span>
                <span>{Math.ceil(windowLeft * lv.tickMs / 1000)}s</span>
              </div>
              <div style={{ background: C.card, height: 14, borderRadius: 8 }}>
                <div style={{ width: (windowLeft / (eng.current ? eng.current.windowTotal : 1)) * 100 + "%", height: "100%", background: C.orange, borderRadius: 8, transition: "width 200ms linear" }} />
              </div>
            </div>
          )}
          {status === "resolving" && (
            <p style={{ marginTop: 12, color: C.muted, fontWeight: 700 }}>Leitura registrada — assista a resolução do mercado…</p>
          )}
        </section>

        {/* controles */}
        {status === "idle" || status === "done" ? (
          <div>
            {verdict && (
              <div style={{ background: verdict.ok ? "rgba(34,197,94,0.14)" : "rgba(240,82,82,0.14)", border: "2px solid " + (verdict.ok ? C.buy : C.sell), borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <p style={{ fontSize: 23, fontWeight: 800, color: verdict.ok ? C.buy : C.sell, marginBottom: 6 }}>
                  {verdict.ok ? "✓ Leitura correta" : verdict.timeout ? "✗ Tempo esgotado" : "✗ Leitura incorreta"}
                  <span style={{ color: C.muted, fontWeight: 600, fontSize: 18, marginLeft: 10 }}>{NAMES[verdict.type]}</span>
                </p>
                <p style={{ marginBottom: 10 }}>
                  <strong>Sua leitura:</strong> {ansLabel[verdict.chosen]} · <strong>Correta:</strong> <span style={{ color: C.buy, fontWeight: 700 }}>{ansLabel[verdict.answer]}</span>
                </p>
                <p>{verdict.timeout ? TIMEOUT_MSG : EXPLAIN[verdict.type](verdict.answer)}</p>
              </div>
            )}
            <button onClick={startSession} style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 16 }}>
              {verdict ? "Abrir novo pregão →" : "▶ Iniciar pregão ao vivo"}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
              {canAnswer ? "Qual força domina?" : "Observe o mercado — a janela de leitura vai abrir…"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => respond("buy")} disabled={!canAnswer}
                style={{ ...btn, background: C.buy, color: "#06220F", padding: "16px 10px", opacity: canAnswer ? 1 : 0.35 }}>▲ COMPRADORA</button>
              <button onClick={() => respond("sell")} disabled={!canAnswer}
                style={{ ...btn, background: C.sell, color: "#2B0606", padding: "16px 10px", opacity: canAnswer ? 1 : 0.35 }}>▼ VENDEDORA</button>
              <button onClick={() => respond("none")} disabled={!canAnswer}
                style={{ ...btn, background: C.navy, color: "#fff", border: "2px solid " + C.grid, padding: "16px 10px", opacity: canAnswer ? 1 : 0.35 }}>◼ SEM LEITURA</button>
            </div>
          </div>
        )}

        <footer style={{ color: C.muted, fontSize: 16, marginTop: 20 }}>
          Motor sintético para treino — não são dados reais nem recomendação. Diferença entre níveis: ruído {LEVELS.n4.noise}× → {LEVELS.n6.noise}×, sutileza crescente e janela de {LEVELS.n4.windowSec}s → {LEVELS.n6.windowSec}s.
        </footer>
      </div>
      <style>{"@keyframes tdpulse{0%,100%{opacity:1}50%{opacity:0.25}}"}</style>
    </div>
  );
}

function LiveChart({ candles }) {
  const W = 820, PRICE_H = 240, VOL_H = 62, DELTA_H = 72, GAP = 32;
  const H = PRICE_H + GAP + VOL_H + GAP + DELTA_H + 14;
  const n = Math.max(candles.length, 1), cw = W / Math.max(n, 10), bw = cw * 0.55;
  const hi = Math.max(...candles.map((k) => k.h));
  const lo = Math.min(...candles.map((k) => k.l));
  const pad = (hi - lo) * 0.1 || 0.5;
  const py = (p) => ((hi + pad - p) / (hi - lo + 2 * pad)) * PRICE_H;
  const maxVol = Math.max(...candles.map((k) => k.vol), 1);
  const maxD = Math.max(...candles.map((k) => Math.abs(k.delta)), 1);
  const volTop = PRICE_H + GAP, deltaTop = volTop + VOL_H + GAP, deltaMid = deltaTop + DELTA_H / 2;
  const lastIdx = candles.length - 1;

  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img" aria-label="Mercado ao vivo">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={PRICE_H * f} y2={PRICE_H * f} stroke={C.grid} strokeWidth="1" strokeDasharray="4 6" />
      ))}
      {/* linha do último preço */}
      <line x1="0" x2={W} y1={py(candles[lastIdx].c)} y2={py(candles[lastIdx].c)} stroke={C.orange} strokeWidth="1.5" strokeDasharray="3 5" opacity="0.7" />
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, up = k.c >= k.o, col = up ? C.buy : C.sell;
        const top = py(Math.max(k.o, k.c));
        const hgt = Math.max(Math.abs(py(k.o) - py(k.c)), 2.5);
        const isLive = i === lastIdx;
        return (
          <g key={i} opacity={isLive ? 1 : 0.92}>
            <line x1={x} x2={x} y1={py(k.h)} y2={py(k.l)} stroke={col} strokeWidth="2.5" />
            <rect x={x - bw / 2} y={top} width={bw} height={hgt} fill={col} rx="2"
              stroke={isLive ? C.text : "none"} strokeWidth={isLive ? 1.5 : 0} />
          </g>
        );
      })}
      <text x="0" y={volTop - 10} fill={C.muted} fontSize="17" fontWeight="700">VOLUME</text>
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, h = (k.vol / maxVol) * VOL_H;
        return <rect key={i} x={x - bw / 2} y={volTop + VOL_H - h} width={bw} height={Math.max(h, 1)}
          fill={k.vol === maxVol ? C.orange : "#5B60B8"} rx="2" />;
      })}
      <text x="0" y={deltaTop - 10} fill={C.muted} fontSize="17" fontWeight="700">DELTA (compra − venda)</text>
      <line x1="0" x2={W} y1={deltaMid} y2={deltaMid} stroke={C.grid} strokeWidth="1.5" />
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, h = (Math.abs(k.delta) / maxD) * (DELTA_H / 2 - 4), pos = k.delta >= 0;
        return <rect key={i} x={x - bw / 2} y={pos ? deltaMid - h : deltaMid} width={bw} height={Math.max(h, 1.5)}
          fill={pos ? C.buy : C.sell} rx="2" />;
      })}
    </svg>
  );
}

function Chip({ label, value, highlight, small }) {
  return (
    <div style={{
      background: highlight ? "rgba(244,123,32,0.18)" : C.surface,
      border: "1px solid " + (highlight ? C.orange : C.grid),
      borderRadius: 12, padding: "8px 16px", minWidth: small ? 0 : 104, textAlign: "center",
    }}>
      <div style={{ fontSize: 15, color: C.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: small ? 17 : 21, fontWeight: 800, color: highlight ? C.orange : C.text }}>{value}</div>
    </div>
  );
}
