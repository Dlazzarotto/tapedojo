"use client";

import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// TAPEDOJO — DOJO WILDER · módulo de treino da Série Mestres
// Dois modos, o aluno escolhe:
//   🖼 MODO ESTUDO — cenário completo, sem pressão de tempo.
//   🔴 MODO PREGÃO — o mesmo cenário se formando ao vivo, tick a
//      tick, com janela de decisão cronometrada.
// Indicadores calculados pelas fórmulas originais de Wilder.
// Protótipo em PT — produção usa o sistema i18n da v2.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278",
  orange: "#F47B20", buy: "#22C55E", sell: "#F05252",
  text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F",
};
const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.round(rnd(a, b));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TICKS = 10;      // ticks por candle no modo pregão
const TICK_MS = 220;   // velocidade do tick
const TAIL = 8;        // candles que se formam ao vivo (o resto é histórico)
const WINDOW_CANDLES = { rsi: 4, atr: 4, adx: 4, sar: 3 };

// ───────── candles ─────────
function trendCloses(n, start, step, noise, dir) {
  const cl = [start];
  for (let i = 1; i < n; i++) cl.push(cl[i - 1] + dir * rnd(step * 0.4, step) + rnd(-noise, noise));
  return cl;
}
function buildCandles(closes, wick = 0.5) {
  const out = [];
  for (let i = 0; i < closes.length; i++) {
    const o = i === 0 ? closes[0] : closes[i - 1];
    const c = closes[i];
    out.push({ o, c, h: Math.max(o, c) + rnd(0.06, wick), l: Math.min(o, c) - rnd(0.06, wick), vol: rndi(28, 50), delta: 0 });
  }
  return out;
}
function baseDeltas(candles, intensity = 0.5) {
  candles.forEach((k) => {
    const up = k.c >= k.o;
    const m = rndi(k.vol * 0.15, k.vol * intensity);
    k.delta = up ? m : -m;
  });
}

// ───────── fórmulas originais de Wilder ─────────
function wilderSmooth(x, p) {
  const out = new Array(x.length).fill(NaN);
  if (x.length < p) return out;
  let s = 0;
  for (let i = 0; i < p; i++) s += x[i];
  out[p - 1] = s / p;
  for (let i = p; i < x.length; i++) out[i] = (out[i - 1] * (p - 1) + x[i]) / p;
  return out;
}
function calcRSI(cl, p = 14) {
  const up = [0], dn = [0];
  for (let i = 1; i < cl.length; i++) {
    const d = cl[i] - cl[i - 1];
    up.push(d > 0 ? d : 0); dn.push(d < 0 ? -d : 0);
  }
  const au = wilderSmooth(up, p), ad = wilderSmooth(dn, p);
  return cl.map((_, i) => {
    if (isNaN(au[i])) return NaN;
    const rs = au[i] / (ad[i] || 1e-9);
    return 100 - 100 / (1 + rs);
  });
}
function trueRange(candles) {
  return candles.map((k, i) => i === 0 ? k.h - k.l
    : Math.max(k.h - k.l, Math.abs(k.h - candles[i - 1].c), Math.abs(k.l - candles[i - 1].c)));
}
function calcATR(candles, p = 14) { return wilderSmooth(trueRange(candles), p); }
function calcADX(candles, p = 14) {
  const n = candles.length, pdm = [0], ndm = [0];
  for (let i = 1; i < n; i++) {
    const up = candles[i].h - candles[i - 1].h, dn = candles[i - 1].l - candles[i].l;
    pdm.push(up > dn && up > 0 ? up : 0);
    ndm.push(dn > up && dn > 0 ? dn : 0);
  }
  const atr_ = wilderSmooth(trueRange(candles), p);
  const spd = wilderSmooth(pdm, p), snd = wilderSmooth(ndm, p);
  const pdi = spd.map((v, i) => (100 * v) / (atr_[i] || 1e-9));
  const ndi = snd.map((v, i) => (100 * v) / (atr_[i] || 1e-9));
  const dx = pdi.map((v, i) => isNaN(v) ? 0 : (100 * Math.abs(v - ndi[i])) / ((v + ndi[i]) || 1e-9));
  const adx = wilderSmooth(dx, p).map((v, i) => (i < 2 * p - 1 ? NaN : v));
  return { adx, pdi, ndi };
}
function calcPSAR(candles, af0 = 0.02, afmax = 0.2) {
  const n = candles.length, sar = new Array(n), trend = new Array(n);
  sar[0] = candles[0].l; trend[0] = 1;
  let ep = candles[0].h, af = af0;
  for (let i = 1; i < n; i++) {
    const prev = sar[i - 1];
    if (trend[i - 1] === 1) {
      let s = prev + af * (ep - prev);
      s = Math.min(s, candles[i - 1].l, i >= 2 ? candles[i - 2].l : candles[i - 1].l);
      if (candles[i].l < s) { trend[i] = -1; sar[i] = ep; ep = candles[i].l; af = af0; }
      else {
        trend[i] = 1; sar[i] = s;
        if (candles[i].h > ep) { ep = candles[i].h; af = Math.min(af + af0, afmax); }
      }
    } else {
      let s = prev + af * (ep - prev);
      s = Math.max(s, candles[i - 1].h, i >= 2 ? candles[i - 2].h : candles[i - 1].h);
      if (candles[i].h > s) { trend[i] = 1; sar[i] = ep; ep = candles[i].h; af = af0; }
      else {
        trend[i] = -1; sar[i] = s;
        if (candles[i].l < ep) { ep = candles[i].l; af = Math.min(af + af0, afmax); }
      }
    }
  }
  return { sar, trend };
}

// painéis calculados a partir dos candles visíveis (estático e ao vivo)
function buildPanes(lesson, candles) {
  if (lesson === "rsi") {
    const rsi = calcRSI(candles.map((k) => k.c));
    return [
      { type: "delta" },
      { type: "line", series: [{ data: rsi, color: "#4C55D8", w: 2.4 }], label: "RSI(14)", ymin: 0, ymax: 100, hlines: [{ y: 70, color: C.sell }, { y: 30, color: C.buy }] },
    ];
  }
  if (lesson === "atr") {
    return [
      { type: "volume" },
      { type: "line", series: [{ data: calcATR(candles), color: C.orange, w: 2.4 }], label: "ATR(14)" },
    ];
  }
  if (lesson === "adx") {
    const { adx, pdi, ndi } = calcADX(candles);
    return [{
      type: "line", label: "ADX · +DI · −DI (14)", hlines: [{ y: 25, color: C.orange }],
      series: [
        { data: adx, color: "#4C55D8", w: 2.6 },
        { data: pdi, color: C.buy, w: 1.4, dash: true },
        { data: ndi, color: C.sell, w: 1.4, dash: true },
      ],
    }];
  }
  return [{ type: "volume" }, { type: "delta" }]; // sar
}

// ───────── lições ─────────
function genRSI() {
  const confirm = pick([true, false]);
  const c1 = trendCloses(16, 100, 0.55, 0.28, 1);
  const c2 = trendCloses(9, c1[15], 0.32, 0.26, -1);
  const top1 = Math.max(...c1);
  const alvo = top1 + rnd(0.8, 1.6);
  const len2 = 15;
  const stepUp = (alvo - c2[8]) / len2;
  const c3 = [];
  let v = c2[8];
  for (let i = 0; i < len2; i++) { v += stepUp + rnd(-0.18, 0.18); c3.push(v); }
  const closes = [...c1, ...c2, ...c3];
  const candles = buildCandles(closes);
  baseDeltas(candles);
  const nn = candles.length;
  for (let i = nn - 4; i < nn; i++) {
    const k = candles[i];
    if (confirm) { k.vol = rndi(16, 26); k.delta = rndi(-10, 6); }
    else { k.vol = rndi(70, 95); k.delta = rndi(k.vol * 0.45, k.vol * 0.65); }
  }
  const p1 = closes.indexOf(top1);
  const p2 = 25 + c3.indexOf(Math.max(...c3));
  return {
    lesson: "rsi", candles,
    marks: { priceLine: [p1, Math.min(p2, nn - 1)], paneLine: { pane: 1, i1: p1, i2: Math.min(p2, nn - 1) } },
    question: "O preço fez topo mais alto e o RSI, topo mais baixo. Olhe o fluxo da última perna: qual é a leitura?",
    options: [
      { id: "rev", label: "Divergência CONFIRMADA — reversão provável" },
      { id: "trend", label: "Divergência SEM confirmação — tendência forte" },
    ],
    answer: confirm ? "rev" : "trend",
    explanation: confirm
      ? "O RSI avisou (velocidade caindo) e o tape confirmou: a última perna subiu com volume seco e delta quase nulo — avanço sem participação, provavelmente stops e recompra. Divergência + fluxo vazio = reversão provável. É o par esforço-resultado fechando a leitura."
      : "O RSI divergiu — mas o tape desmentiu: a última perna veio com volume alto e delta comprador forte, iniciativa real consumindo o book. Em tendência forte o RSI diverge o tempo todo; sem confirmação do fluxo, apostar contra é atravessar na frente do comprador. Wilder levanta a hipótese; o fluxo julga.",
  };
}

function genATR() {
  const variant = pick(["up", "down", "flat"]);
  let closes;
  if (variant === "up") {
    closes = [...trendCloses(24, 100, 0.16, 0.14, pick([1, -1])), ...trendCloses(16, 100, 0.5, 0.85, pick([1, -1]))];
    for (let i = 24; i < 40; i++) closes[i] = closes[23] + (closes[i] - closes[24]) + rnd(-0.3, 0.3);
  } else if (variant === "down") {
    closes = [...trendCloses(20, 100, 0.55, 0.9, pick([1, -1])), ...trendCloses(20, 100, 0.15, 0.14, pick([1, -1]))];
    for (let i = 20; i < 40; i++) closes[i] = closes[19] + (closes[i] - closes[20]) + rnd(-0.1, 0.1);
  } else {
    closes = trendCloses(40, 100, 0.28, 0.35, pick([1, -1]));
  }
  const candles = buildCandles(closes, variant === "up" ? 0.9 : 0.45);
  if (variant === "up") for (let i = 24; i < 40; i++) { candles[i].h += rnd(0.3, 0.9); candles[i].l -= rnd(0.3, 0.9); }
  if (variant === "down") for (let i = 0; i < 20; i++) { candles[i].h += rnd(0.3, 0.8); candles[i].l -= rnd(0.3, 0.8); }
  baseDeltas(candles);
  return {
    lesson: "atr", candles, marks: null,
    question: "Seu risco por operação é FIXO em dinheiro. Olhando o ATR, o que fazer com o tamanho da próxima posição?",
    options: [
      { id: "menor", label: "Reduzir a posição" },
      { id: "maior", label: "Posição pode ser maior" },
      { id: "manter", label: "Manter o tamanho" },
    ],
    answer: variant === "up" ? "menor" : variant === "down" ? "maior" : "manter",
    explanation: variant === "up"
      ? "O ATR saltou: cada ponto agora carrega mais risco, e o stop honesto ficou mais largo. Com risco fixo em dinheiro, tamanho e ATR são inversos — volatilidade dobrou, posição cai. É o uso do ATR que sobrevive a qualquer estilo: sizing, não sinal."
      : variant === "down"
      ? "O ATR derreteu: o mercado encolheu o passo, o stop honesto ficou mais curto. Com risco fixo, a posição PODE crescer proporcionalmente — mesmo risco em dinheiro, mais contratos. Ajustar para os dois lados é o que mantém o risco constante de verdade."
      : "O ATR está estável: o regime de volatilidade não mudou, e o tamanho calibrado continua certo. Não mexer também é decisão — recalibrar sem mudança de regime é ruído virando ação.",
  };
}

function genADX() {
  const trendMode = pick([true, false]);
  const dir = pick([1, -1]);
  let closes;
  if (trendMode) {
    closes = trendCloses(42, 100, 0.5, 0.28, dir);
  } else {
    const base = trendCloses(14, 100, 0.45, 0.3, dir);
    const flat = [];
    for (let i = 0; i < 28; i++) flat.push(base[13] + rnd(-1.1, 1.1));
    closes = [...base, ...flat];
  }
  const candles = buildCandles(closes);
  baseDeltas(candles);
  return {
    lesson: "adx", candles, marks: null,
    question: "Antes de qualquer entrada, a pergunta de Wilder: que regime é este?",
    options: [
      { id: "trend", label: "Tendência — continuação tem vento a favor" },
      { id: "range", label: "Lateral — continuação vai sofrer" },
    ],
    answer: trendMode ? "trend" : "range",
    explanation: trendMode
      ? "ADX sustentado acima de ~25 e subindo, com um DI claramente dominante: um lado do leilão manda com consistência. Estratégias de continuação (rompimentos, pullbacks a favor) têm vento a favor; apostar em reversão aqui é lutar contra o regime."
      : "ADX baixo ou derretendo, DIs trançados: leilão equilibrado — lateral. Rompimentos tendem a falhar e o preço volta para o valor. É o regime de operar extremos (ou de não operar); continuação aqui morre no meio do caminho. Wilder criou o ADX exatamente para fazer esta triagem antes do SAR operar.",
  };
}

function genSAR() {
  const hunt = pick([true, false]);
  const closes = trendCloses(26, 100, 0.5, 0.26, 1);
  const candles = buildCandles(closes, 0.4);
  baseDeltas(candles, 0.5);
  const { sar } = calcPSAR(candles);
  const curSar = sar[25];
  const prev = candles[25];
  const touch = { o: prev.c, vol: rndi(95, 130) };
  touch.l = curSar - rnd(0.05, 0.2);
  if (hunt) {
    touch.c = touch.o - rnd(0.0, 0.15);
    touch.h = touch.o + rnd(0.1, 0.25);
    touch.delta = -rndi(touch.vol * 0.5, touch.vol * 0.7);
  } else {
    touch.c = touch.l + rnd(0.05, 0.18);
    touch.h = touch.o + rnd(0.05, 0.15);
    touch.delta = -rndi(touch.vol * 0.5, touch.vol * 0.7);
  }
  candles.push(touch);
  let last = touch.c;
  for (let i = 0; i < 2; i++) {
    const o = last, mv = hunt ? rnd(0.35, 0.6) : -rnd(0.35, 0.6);
    const c = o + mv;
    const k = { o, c, h: Math.max(o, c) + rnd(0.05, 0.18), l: Math.min(o, c) - rnd(0.05, 0.18), vol: rndi(45, 70) };
    k.delta = Math.round((hunt ? 1 : -1) * k.vol * rnd(0.35, 0.55));
    candles.push(k);
    last = c;
  }
  return {
    lesson: "sar", candles, marks: null, hasSar: true,
    question: "O preço tocou o Parabolic SAR (o stop). Olhe volume e delta no toque e na sequência: o que aconteceu?",
    options: [
      { id: "exit", label: "Saída técnica — iniciativa vendedora real" },
      { id: "hunt", label: "Caça de stops — a venda foi ABSORVIDA" },
    ],
    answer: hunt ? "hunt" : "exit",
    explanation: hunt
      ? "O toque veio com volume enorme e delta fortemente vendedor — mas o candle fechou lá em cima, devolvendo o mergulho, e a sequência retomou a alta. Esforço vendedor máximo, resultado nenhum: absorção no exato nível onde os stops moravam. O SAR mandou sair; o fluxo mostrou que a saída era o presente para quem comprou dos stops. Regra da casa: stop tocado COM absorção = reavaliar reentrada, nunca inverter junto com a manada."
      : "O toque veio com volume alto, delta vendedor e fechamento NA mínima — e a sequência confirmou para baixo. Iniciativa real consumindo o book de compra: a saída do SAR foi tecnicamente perfeita, exatamente o que Wilder desenhou. Disciplina de saída não se discute quando o fluxo assina embaixo.",
  };
}

const GENS = [genRSI, genATR, genADX, genSAR];
const LESSON_NAME = { rsi: "RSI · Divergência e fluxo", atr: "ATR · Sizing por volatilidade", adx: "ADX · Triagem de regime", sar: "Parabolic SAR · Saída ou caça" };
const TIMEOUT_MSG = "A janela fechou sem decisão. No pregão, não decidir também é uma decisão — e nos módulos de mestre, hesitar custa a questão, exatamente porque no mercado real custa dinheiro.";

// caminho de ticks dentro do candle (para o modo pregão)
function tickPath(k, T) {
  const up = k.c >= k.o;
  const a = 2 + Math.floor(Math.random() * 3);
  const b = Math.min(T - 2, a + 2 + Math.floor(Math.random() * 3));
  const first = up ? k.l : k.h, second = up ? k.h : k.l;
  const anchors = [[0, k.o], [a, first], [b, second], [T - 1, k.c]];
  const out = new Array(T);
  for (let s = 0; s < anchors.length - 1; s++) {
    const i1 = anchors[s][0], v1 = anchors[s][1], i2 = anchors[s + 1][0], v2 = anchors[s + 1][1];
    for (let i = i1; i <= i2; i++) {
      const t = (i - i1) / Math.max(i2 - i1, 1);
      out[i] = v1 + (v2 - v1) * t + (i !== i1 && i !== i2 ? rnd(-1, 1) * (k.h - k.l) * 0.07 : 0);
    }
  }
  for (let i = 0; i < T; i++) out[i] = Math.min(k.h, Math.max(k.l, out[i]));
  out[a] = first; out[b] = second; out[0] = k.o; out[T - 1] = k.c;
  return out;
}

// ───────── gráfico multi-painéis ─────────
function MultiChart({ lesson, candles, marks, showSar, liveIdx }) {
  const panes = buildPanes(lesson, candles);
  const W = 840, PRICE_H = 220, PANE_H = 74, GAP = 30;
  const H = PRICE_H + panes.length * (PANE_H + GAP) + 8;
  const n = candles.length, cw = W / n, bw = cw * 0.55;
  const hi = Math.max(...candles.map((k) => k.h));
  const lo = Math.min(...candles.map((k) => k.l));
  const pad = (hi - lo) * 0.09 || 0.5;
  const py = (p) => ((hi + pad - p) / (hi - lo + 2 * pad)) * PRICE_H;
  const X = (i) => i * cw + cw / 2;

  const els = [];
  [0.25, 0.5, 0.75].forEach((f) => els.push(
    <line key={"g" + f} x1="0" x2={W} y1={PRICE_H * f} y2={PRICE_H * f} stroke={C.grid} strokeWidth="1" strokeDasharray="4 6" />));
  candles.forEach((k, i) => {
    const up = k.c >= k.o, col = up ? C.buy : C.sell;
    const isLive = liveIdx !== undefined && i === liveIdx;
    els.push(<line key={"w" + i} x1={X(i)} x2={X(i)} y1={py(k.h)} y2={py(k.l)} stroke={col} strokeWidth="2.2" />);
    els.push(<rect key={"b" + i} x={X(i) - bw / 2} y={py(Math.max(k.o, k.c))} width={bw}
      height={Math.max(Math.abs(py(k.o) - py(k.c)), 2.2)} fill={col} rx="2"
      stroke={isLive ? C.text : "none"} strokeWidth={isLive ? 1.6 : 0} />);
  });
  if (marks && marks.priceLine) {
    const i1 = marks.priceLine[0], i2 = marks.priceLine[1];
    els.push(<line key="pl" x1={X(i1)} x2={X(i2)} y1={py(candles[i1].h) - 6} y2={py(candles[i2].h) - 6}
      stroke={C.text} strokeWidth="2.4" strokeDasharray="8 6" opacity="0.9" />);
  }
  if (showSar) {
    const s = calcPSAR(candles);
    s.sar.forEach((v, i) => {
      els.push(<circle key={"s" + i} cx={X(i)} cy={py(v)} r="3.4"
        fill={s.trend[i] === 1 ? C.buy : C.sell} stroke={C.bg} strokeWidth="1" />);
    });
  }

  let top = PRICE_H + GAP;
  panes.forEach((p, pi) => {
    const key = "p" + pi;
    if (p.type === "volume") {
      const mx = Math.max(...candles.map((k) => k.vol), 1);
      els.push(<text key={key + "t"} x="0" y={top - 9} fill={C.muted} fontSize="16" fontWeight="700">VOLUME</text>);
      candles.forEach((k, i) => {
        const h = (k.vol / mx) * PANE_H;
        els.push(<rect key={key + i} x={X(i) - bw / 2} y={top + PANE_H - h} width={bw} height={Math.max(h, 1)}
          fill={k.vol === mx ? C.orange : "#5B60B8"} rx="2" />);
      });
    } else if (p.type === "delta") {
      const mx = Math.max(...candles.map((k) => Math.abs(k.delta)), 1);
      const mid = top + PANE_H / 2;
      els.push(<text key={key + "t"} x="0" y={top - 9} fill={C.muted} fontSize="16" fontWeight="700">DELTA (compra − venda)</text>);
      els.push(<line key={key + "m"} x1="0" x2={W} y1={mid} y2={mid} stroke={C.grid} strokeWidth="1.4" />);
      candles.forEach((k, i) => {
        const h = (Math.abs(k.delta) / mx) * (PANE_H / 2 - 3), pos = k.delta >= 0;
        els.push(<rect key={key + i} x={X(i) - bw / 2} y={pos ? mid - h : mid} width={bw} height={Math.max(h, 1.4)}
          fill={pos ? C.buy : C.sell} rx="2" />);
      });
    } else if (p.type === "line") {
      const valid = p.series.flatMap((s) => s.data.filter((v) => !isNaN(v)));
      if (valid.length) {
        const ymin = p.ymin !== undefined ? p.ymin : Math.min(...valid);
        const ymax = p.ymax !== undefined ? p.ymax : Math.max(...valid);
        const sy = (v) => top + PANE_H - ((v - ymin) / ((ymax - ymin) || 1)) * PANE_H;
        els.push(<text key={key + "t"} x="0" y={top - 9} fill={C.muted} fontSize="16" fontWeight="700">{p.label}</text>);
        (p.hlines || []).forEach((hl, j) => {
          els.push(<line key={key + "h" + j} x1="0" x2={W} y1={sy(hl.y)} y2={sy(hl.y)} stroke={hl.color} strokeWidth="1.3" strokeDasharray="3 5" />);
        });
        p.series.forEach((s, si) => {
          let d = "", started = false;
          s.data.forEach((v, i) => {
            if (isNaN(v)) return;
            d += (started ? " L " : "M ") + X(i) + " " + sy(v);
            started = true;
          });
          els.push(<path key={key + "s" + si} d={d} fill="none" stroke={s.color} strokeWidth={s.w}
            strokeDasharray={s.dash ? "6 5" : "none"} strokeLinejoin="round" />);
        });
        if (marks && marks.paneLine && marks.paneLine.pane === pi) {
          const i1 = marks.paneLine.i1, i2 = marks.paneLine.i2;
          const v1 = p.series[0].data[i1], v2 = p.series[0].data[i2];
          if (!isNaN(v1) && !isNaN(v2)) {
            els.push(<line key={key + "pl"} x1={X(i1)} x2={X(i2)} y1={sy(v1) - 4} y2={sy(v2) - 4}
              stroke={C.orange} strokeWidth="2.4" strokeDasharray="8 6" />);
          }
        }
      }
    }
    top += PANE_H + GAP;
  });

  return <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img" aria-label="Cenário com painel de indicador">{els}</svg>;
}

// ═══════════════ APP ═══════════════
export default function App() {
  const [mode, setMode] = useState("estudo"); // 'estudo' | 'pregao'
  const [q, setQ] = useState(() => pick(GENS)());
  const [answered, setAnswered] = useState(null);
  const [hist, setHist] = useState([]);

  // estado do modo pregão
  const [liveStatus, setLiveStatus] = useState("idle"); // idle | observe | window | done
  const [liveCandles, setLiveCandles] = useState([]);
  const [liveIdx, setLiveIdx] = useState(0);
  const [windowLeft, setWindowLeft] = useState(0);
  const [timeoutFlag, setTimeoutFlag] = useState(false);
  const eng = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const total = hist.length;
  const correct = hist.filter(Boolean).length;
  const last10 = hist.slice(-10);
  const exam = last10.length >= 10 && last10.filter(Boolean).length >= 7;
  const acc = total ? Math.round((correct / total) * 100) : 0;

  function newQuestion(m) {
    clearInterval(timer.current);
    const nq = pick(GENS)();
    setQ(nq); setAnswered(null); setTimeoutFlag(false);
    if (m === "pregao") startLive(nq); else setLiveStatus("idle");
  }

  function switchMode(m) {
    if (m === mode) return;
    setMode(m);
    newQuestion(m);
  }

  // ── motor do modo pregão: replay tick a tick da cauda do cenário ──
  function startLive(nq) {
    clearInterval(timer.current);
    const histCount = nq.candles.length - TAIL;
    const winStart = nq.candles.length - WINDOW_CANDLES[nq.lesson];
    eng.current = {
      q: nq, idx: histCount, tick: 0,
      path: tickPath(nq.candles[histCount], TICKS),
      winStart, chosen: null,
      winTotal: WINDOW_CANDLES[nq.lesson] * TICKS, winTicks: 0,
    };
    setLiveCandles(nq.candles.slice(0, histCount));
    setLiveIdx(histCount);
    setLiveStatus("observe");
    setWindowLeft(0);
    timer.current = setInterval(liveTick, TICK_MS);
  }

  function liveTick() {
    const e = eng.current;
    if (!e) return;
    const src = e.q.candles[e.idx];
    e.tick++;
    const t = e.tick;
    const prices = e.path.slice(0, t);
    const forming = {
      o: src.o, c: prices[t - 1],
      h: Math.max(...prices), l: Math.min(...prices),
      vol: Math.max(1, Math.round(src.vol * t / TICKS)),
      delta: Math.round(src.delta * t / TICKS),
    };
    const closed = e.q.candles.slice(0, e.idx);
    setLiveCandles([...closed, forming]);
    setLiveIdx(e.idx);

    // janela de decisão
    if (e.idx >= e.winStart && e.chosen === null) {
      if (liveStatusRefSafe() !== "window") setLiveStatus("window");
      e.winTicks++;
      setWindowLeft(Math.max(0, e.winTotal - e.winTicks));
    }

    if (t >= TICKS) {
      e.idx++; e.tick = 0;
      if (e.idx >= e.q.candles.length) return finishLive();
      e.path = tickPath(e.q.candles[e.idx], TICKS);
    }
  }
  // leitura segura do status sem stale closure
  const statusRef = useRef("idle");
  useEffect(() => { statusRef.current = liveStatus; }, [liveStatus]);
  function liveStatusRefSafe() { return statusRef.current; }

  function finishLive() {
    clearInterval(timer.current);
    const e = eng.current;
    setLiveCandles(e.q.candles);
    setLiveIdx(e.q.candles.length - 1);
    if (e.chosen === null) {
      setTimeoutFlag(true);
      setAnswered("__timeout__");
      setHist((h) => [...h, false]);
    }
    setLiveStatus("done");
  }

  function respond(id) {
    if (answered) return;
    if (mode === "pregao") {
      const e = eng.current;
      if (!e || liveStatus !== "window" || e.chosen !== null) return;
      e.chosen = id;
      setAnswered(id);
      setHist((h) => [...h, id === e.q.answer]);
      // o pregão continua rodando até o fim para mostrar a resolução
      setLiveStatus("observe");
      return;
    }
    setAnswered(id);
    setHist((h) => [...h, id === q.answer]);
  }

  const btn = { minHeight: 60, fontSize: 19, fontWeight: 800, borderRadius: 14, border: "none", cursor: "pointer" };
  const ok = answered === q.answer;
  const isLiveRunning = mode === "pregao" && (liveStatus === "observe" || liveStatus === "window");
  const showChart = mode === "estudo" ? q.candles : liveCandles;
  const showFeedback = answered && (mode === "estudo" || liveStatus === "done");
  const canAnswer = mode === "estudo" ? !answered : liveStatus === "window";

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
      <div className="max-w-3xl mx-auto px-4 py-5">

        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              Tape<span style={{ color: C.orange }}>Dojo</span>
              <span style={{ color: C.orange, fontWeight: 800, fontSize: 16, border: "2px solid " + C.orange, borderRadius: 999, padding: "2px 12px", marginLeft: 8, verticalAlign: "middle" }}>DOJO WILDER</span>
            </div>
            <div style={{ color: C.muted, fontSize: 16 }}>Módulo de treino da Série Mestres · Vol. 1 — protótipo</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => switchMode("estudo")}
              style={{ ...btn, minHeight: 54, fontSize: 17, padding: "8px 16px", background: mode === "estudo" ? C.orange : C.navy, color: "#fff" }}>
              🖼 Modo Estudo
            </button>
            <button onClick={() => switchMode("pregao")}
              style={{ ...btn, minHeight: 54, fontSize: 17, padding: "8px 16px", background: mode === "pregao" ? C.orange : C.navy, color: "#fff" }}>
              🔴 Modo Pregão
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          <Chip label="Acerto" value={acc + "%"} />
          <Chip label="Questões" value={total} />
          <Chip label="Exame (últ. 10)" value={last10.filter(Boolean).length + "/" + last10.length} highlight={exam} />
        </div>

        {exam && (
          <div style={{ background: "rgba(34,197,94,0.12)", border: "2px solid " + C.buy, borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 21, color: C.buy, marginBottom: 4 }}>🥋 Certificado Wilder desbloqueado (demonstração)</p>
            <p>7+ acertos nas últimas 10 questões. Em produção, o certificado é emitido no perfil e registrado no histórico do aluno.</p>
          </div>
        )}

        <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 18, marginBottom: 14 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span style={{ color: C.orange, fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {LESSON_NAME[q.lesson]} · mercado simulado
            </span>
            {isLiveRunning && (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.sell, fontWeight: 800, fontSize: 16 }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: C.sell, animation: "tdw 1s infinite" }} />AO VIVO
              </span>
            )}
          </div>

          {showChart.length > 0 && (
            <MultiChart lesson={q.lesson} candles={showChart}
              marks={mode === "estudo" ? q.marks : null}
              showSar={q.lesson === "sar"}
              liveIdx={isLiveRunning ? liveIdx : undefined} />
          )}

          {mode === "pregao" && liveStatus === "window" && (
            <div style={{ marginTop: 12 }}>
              <div className="flex justify-between" style={{ fontWeight: 800, color: C.orange, marginBottom: 6 }}>
                <span>⏱ Janela de decisão aberta</span>
                <span>{Math.ceil(windowLeft * TICK_MS / 1000)}s</span>
              </div>
              <div style={{ background: C.card, height: 14, borderRadius: 8 }}>
                <div style={{ width: (eng.current ? (windowLeft / eng.current.winTotal) * 100 : 0) + "%", height: "100%", background: C.orange, borderRadius: 8, transition: "width 200ms linear" }} />
              </div>
            </div>
          )}
          {mode === "pregao" && answered && liveStatus !== "done" && (
            <p style={{ marginTop: 12, color: C.muted, fontWeight: 700 }}>Decisão registrada — assista a resolução…</p>
          )}
        </section>

        {!showFeedback ? (
          <section>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              {mode === "pregao" && liveStatus === "observe" && !answered
                ? "Observe o mercado se formando — a janela de decisão vai abrir…"
                : q.question}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((op) => (
                <button key={op.id} onClick={() => respond(op.id)} disabled={!canAnswer}
                  style={{ ...btn, background: C.navy, color: "#fff", border: "2px solid " + C.grid, padding: "16px 14px", textAlign: "left", opacity: canAnswer ? 1 : 0.4 }}>
                  {op.label}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section aria-live="polite">
            <div style={{ background: ok ? "rgba(34,197,94,0.14)" : "rgba(240,82,82,0.14)", border: "2px solid " + (ok ? C.buy : C.sell), borderRadius: 16, padding: 18, marginBottom: 14 }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: ok ? C.buy : C.sell, marginBottom: 8 }}>
                {ok ? "✓ Decisão correta" : timeoutFlag ? "✗ Tempo esgotado" : "✗ Decisão incorreta"}
                <span style={{ color: C.muted, fontWeight: 600, fontSize: 17, marginLeft: 10 }}>{LESSON_NAME[q.lesson]}</span>
              </p>
              {!ok && !timeoutFlag && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Correta:</strong>{" "}
                  <span style={{ color: C.buy, fontWeight: 700 }}>{q.options.find((o) => o.id === q.answer).label}</span>
                </p>
              )}
              {timeoutFlag && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Correta:</strong>{" "}
                  <span style={{ color: C.buy, fontWeight: 700 }}>{q.options.find((o) => o.id === q.answer).label}</span>
                </p>
              )}
              <p>{timeoutFlag ? TIMEOUT_MSG + " " + q.explanation : q.explanation}</p>
            </div>
            <button onClick={() => newQuestion(mode)} style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 16 }}>
              {mode === "pregao" ? "Abrir novo pregão →" : "Próxima questão →"}
            </button>
          </section>
        )}

        {mode === "pregao" && liveStatus === "idle" && !answered && (
          <button onClick={() => startLive(q)} style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 16, marginTop: 12 }}>
            ▶ Iniciar pregão ao vivo
          </button>
        )}

        <footer style={{ color: C.muted, fontSize: 16, marginTop: 20 }}>
          Indicadores calculados pelas fórmulas originais de Wilder sobre dados simulados — no Modo Pregão, recalculados a cada tick. Material educacional — não é recomendação de operação.
        </footer>
      </div>
      <style>{"@keyframes tdw{0%,100%{opacity:1}50%{opacity:0.25}}"}</style>
    </div>
  );
}

function Chip({ label, value, highlight }) {
  return (
    <div style={{
      background: highlight ? "rgba(34,197,94,0.16)" : C.surface,
      border: "1px solid " + (highlight ? C.buy : C.grid),
      borderRadius: 12, padding: "8px 14px", minWidth: 96, textAlign: "center",
    }}>
      <div style={{ fontSize: 14.5, color: C.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: highlight ? C.buy : C.text }}>{value}</div>
    </div>
  );
}
