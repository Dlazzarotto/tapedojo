"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import GlossaryBody, { glossLang } from "@/components/GlossaryBody";

export default function Page() {
  const [lang, setLang] = useState("en");
  useEffect(() => { setLang(glossLang()); }, []);
  return (
    <div style={{ background: "#12143A", minHeight: "100vh" }}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link href="/" style={{ color: "#F47B20", fontWeight: 800, fontSize: 17, textDecoration: "none" }}>← TapeDojo</Link>
        <div style={{ marginTop: 12 }}>
          <GlossaryBody lang={lang} />
        </div>
      </div>
    </div>
  );
}
