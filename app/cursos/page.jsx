"use client";
import Link from "next/link";

const C = { bg: "#12143A", surface: "#1B1E52", orange: "#F47B20", text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F" };

export default function Cursos() {
  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
      <div className="max-w-3xl mx-auto px-5 py-6">
        <Link href="/" style={{ color: C.orange, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>← Início</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "16px 0 6px" }}>Biblioteca · Série Mestres</h1>
        <p style={{ color: C.muted, marginBottom: 22 }}>
          Apostilas em PDF de alta qualidade para baixar e guardar. Cada volume vem com o módulo de treino do mestre — Modo Estudo e Modo Pregão — e o exame de certificação.
        </p>

        <div style={{ background: C.surface, border: "1px solid " + C.grid, borderRadius: 18, padding: 20 }}>
          <p style={{ color: C.orange, fontWeight: 800, fontSize: 14.5, letterSpacing: "0.08em", marginBottom: 4 }}>VOL. 1 · DISPONÍVEL</p>
          <p style={{ fontWeight: 800, fontSize: 23, marginBottom: 6 }}>J. Welles Wilder Jr. — O engenheiro que mediu o mercado</p>
          <p style={{ color: C.muted, marginBottom: 16 }}>RSI · ATR · ADX · Parabolic SAR — o que cada um mede por dentro, o que não enxerga, e onde o fluxo completa.</p>
          <div className="flex flex-wrap gap-3">
            <a href="/cursos/tapedojo-mestres-wilder.pdf" download
              style={{ background: C.orange, color: "#231000", fontWeight: 800, fontSize: 18, padding: "14px 22px", borderRadius: 14, textDecoration: "none", display: "inline-block", minHeight: 54 }}>
              ⬇ Baixar apostila (PDF)
            </a>
            <Link href="/mestres/wilder"
              style={{ background: "#2D3278", color: "#fff", fontWeight: 800, fontSize: 18, padding: "14px 22px", borderRadius: 14, textDecoration: "none", display: "inline-block", minHeight: 54 }}>
              🥋 Abrir o Dojo Wilder
            </Link>
          </div>
        </div>

        <p style={{ color: C.muted, fontSize: 16, marginTop: 20 }}>
          Próximos volumes: Wyckoff · Steidlmayer · Granville · Appel · Bollinger · Donchian · DeMark · Fibonacci e os herdeiros.
        </p>
      </div>
    </main>
  );
}
