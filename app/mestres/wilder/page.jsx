"use client";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import App from "@/components/DojoWilder";

export default function Page() {
  return (
    <div style={{ background: "#12143A", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-4 pt-3">
        <Link href="/" style={{ color: "#F47B20", fontWeight: 800, fontSize: 17, textDecoration: "none" }}>← Início</Link>
      </div>
      <AuthGate>
        <App />
      </AuthGate>
    </div>
  );
}
