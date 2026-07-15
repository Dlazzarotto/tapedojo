"use client";
import { useState } from "react";
import { GLOSSARY, searchGlossary } from "@/lib/glossary";

const C = { bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278", orange: "#F47B20", text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F" };

const D = {
  pt: { title: "📖 Glossário do Dojo", intro: "O mercado fala em código — aqui está a tradução, em linguagem de gente.", search: "Buscar termo (ex.: delta, book, absorção…)", empty: "Nenhum termo encontrado — tenta outra palavra.", close: "Fechar" },
  en: { title: "📖 Dojo Glossary", intro: "The market speaks in code — here's the plain-language translation.", search: "Search a term (e.g., delta, book, absorption…)", empty: "No term found — try another word.", close: "Close" },
  es: { title: "📖 Glosario del Dojo", intro: "El mercado habla en código — aquí está la traducción, en lenguaje de gente.", search: "Buscar término (ej.: delta, book, absorción…)", empty: "Ningún término encontrado — prueba otra palabra.", close: "Cerrar" },
};

export function glossLang() {
  try { const v = localStorage.getItem("td:lang"); if (v) { const k = JSON.parse(v); if (D[k]) return k; } } catch (e) { /* primeira visita */ }
  return "en";
}

export default function GlossaryBody({ lang }) {
  const L = D[lang] ? lang : "en";
  const T = D[L];
  const [q, setQ] = useState("");
  const list = searchGlossary(q, L);
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: C.text }}>
      <p style={{ fontWeight: 800, fontSize: 24, marginBottom: 2 }}>{T.title}</p>
      <p style={{ color: C.muted, fontSize: 15.5, marginBottom: 14 }}>{T.intro}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T.search}
        style={{ width: "100%", fontSize: 17, padding: "13px 14px", borderRadius: 12, border: "2px solid " + C.grid, background: C.bg, color: C.text, marginBottom: 14 }} />
      {list.length === 0 && <p style={{ color: C.muted }}>{T.empty}</p>}
      {list.map((g) => (
        <div key={g.id} style={{ background: C.surface, border: "1px solid " + C.grid, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <p style={{ color: C.orange, fontWeight: 800, fontSize: 17.5, marginBottom: 4 }}>{g[L].term}</p>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.55 }}>{g[L].def}</p>
        </div>
      ))}
    </div>
  );
}

export function GlossaryModal({ lang, onClose }) {
  const L = D[lang] ? lang : "en";
  return (
    <div role="dialog" aria-label={D[L].title}
      style={{ position: "fixed", inset: 0, background: "rgba(6,7,24,0.92)", zIndex: 80, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div style={{ background: C.card, border: "2px solid " + C.orange, borderRadius: 18, maxWidth: 640, width: "100%", padding: 18, margin: "20px 0" }}>
        <GlossaryBody lang={L} />
        <button onClick={onClose}
          style={{ width: "100%", minHeight: 52, background: C.orange, color: "#231000", fontWeight: 800, fontSize: 17, border: "none", borderRadius: 12, marginTop: 6, cursor: "pointer" }}>
          {D[L].close}
        </button>
      </div>
    </div>
  );
}
