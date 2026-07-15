"use client";
import { useEffect, useState } from "react";
import { supabase, seedCloud, stopCloud } from "@/lib/supabase";
import { bestGrant } from "@/lib/grants";

const C = { bg: "#12143A", surface: "#1B1E52", navy: "#2D3278", orange: "#F47B20", buy: "#22C55E", sell: "#F05252", text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F" };

const A = {
  pt: {
    make: "Criar perfil", enter: "Entrar", title: "Entre no dojo",
    sub: "Crie seu perfil gratuito — 7 dias com acesso total a tudo.",
    name: "Seu nome", email: "E-mail", pass: "Senha (mín. 6)",
    optin: "Quero receber novidades do dojo (opcional)",
    have: "Já tenho perfil — entrar", noacc: "Não tenho perfil — criar",
    forgot: "Esqueci a senha", reset: "Enviar link de redefinição",
    sent: "Se este e-mail existir no dojo, o link de redefinição foi enviado.",
    checkMail: "Perfil criado! Confirme no seu e-mail para entrar.",
    out: "Sair", hello: "🥋",
    errBad: "E-mail ou senha incorretos.", errExists: "Este e-mail já tem perfil — use Entrar.",
    errShort: "A senha precisa de pelo menos 6 caracteres.", errName: "Diga seu nome, guerreiro.",
    errGeneric: "Algo falhou. Tente de novo.", wait: "Abrindo o dojo…",
  },
  en: {
    make: "Create profile", enter: "Sign in", title: "Enter the dojo",
    sub: "Create your free profile — 7 days with full access to everything.",
    name: "Your name", email: "Email", pass: "Password (min. 6)",
    optin: "Send me dojo news (optional)",
    have: "I have a profile — sign in", noacc: "No profile yet — create one",
    forgot: "Forgot password", reset: "Send reset link",
    sent: "If this email exists in the dojo, a reset link was sent.",
    checkMail: "Profile created! Confirm via email to sign in.",
    out: "Sign out", hello: "🥋",
    errBad: "Wrong email or password.", errExists: "This email already has a profile — use Sign in.",
    errShort: "Password needs at least 6 characters.", errName: "Tell us your name, warrior.",
    errGeneric: "Something failed. Try again.", wait: "Opening the dojo…",
  },
  es: {
    make: "Crear perfil", enter: "Entrar", title: "Entra al dojo",
    sub: "Crea tu perfil gratuito — 7 días con acceso total a todo.",
    name: "Tu nombre", email: "Correo", pass: "Contraseña (mín. 6)",
    optin: "Quiero recibir novedades del dojo (opcional)",
    have: "Ya tengo perfil — entrar", noacc: "No tengo perfil — crear",
    forgot: "Olvidé la contraseña", reset: "Enviar enlace de restablecimiento",
    sent: "Si este correo existe en el dojo, se envió el enlace.",
    checkMail: "¡Perfil creado! Confirma por correo para entrar.",
    out: "Salir", hello: "🥋",
    errBad: "Correo o contraseña incorrectos.", errExists: "Este correo ya tiene perfil — usa Entrar.",
    errShort: "La contraseña necesita al menos 6 caracteres.", errName: "Dinos tu nombre, guerrero.",
    errGeneric: "Algo falló. Inténtalo de nuevo.", wait: "Abriendo el dojo…",
  },
};

function getLang() {
  try { const v = localStorage.getItem("td:lang"); if (v) { const k = JSON.parse(v); if (A[k]) return k; } } catch (e) { /* primeira visita */ }
  return "en";
}
const monthKey = () => new Date().toISOString().slice(0, 7);

export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const [sess, setSess] = useState(null);
  const [lang] = useState(getLang);
  const T = A[lang];
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [optin, setOptin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let sub = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await onSession(data.session);
      setReady(true);
      const res = supabase.auth.onAuthStateChange(async (_e, s) => {
        if (s) { await onSession(s); } else { setSess(null); stopCloud(); }
      });
      sub = res.data;
    })();
    return () => { if (sub) sub.subscription.unsubscribe(); };
  }, []);

  async function onSession(s) {
    await seedCloud(s);
    const nm = (s.user.user_metadata && s.user.user_metadata.display_name) || (s.user.email || "").split("@")[0];
    try { localStorage.setItem("td:cloudName", JSON.stringify(nm)); } catch (e) { /* cheio */ }
    try {
      await supabase.from("td_profiles").upsert(
        { user_id: s.user.id, display_name: nm, lang, points_month: monthKey(), marketing_opt_in: !!(s.user.user_metadata && s.user.user_metadata.marketing_opt_in) },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
      const m = document.cookie.match(/(?:^|; )td-country=([^;]+)/);
      const country = m ? decodeURIComponent(m[1]) : "";
      if (country) await supabase.from("td_profiles").update({ country }).eq("user_id", s.user.id);
    } catch (e) { /* melhor esforço */ }
    try {
      const { data: gr } = await supabase.from("td_grants").select("tier, expires_at");
      if (typeof window !== "undefined") window.__tdGrant = bestGrant(gr, Date.now());
    } catch (e) { if (typeof window !== "undefined") window.__tdGrant = null; }
    setSess(s);
  }

  function mapErr(e) {
    const m = (e && e.message) || "";
    if (m.includes("Invalid login")) return T.errBad;
    if (m.toLowerCase().includes("already registered")) return T.errExists;
    if (m.toLowerCase().includes("at least 6")) return T.errShort;
    return T.errGeneric;
  }

  function pingCockpit() {
    // sino do mestre: avisa o Dashboard em tempo real que entrou aluno novo
    try {
      const ch = supabase.channel("td-live");
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          ch.send({ type: "broadcast", event: "signup", payload: { at: Date.now() } });
          setTimeout(() => { try { supabase.removeChannel(ch); } catch (e) { /* ok */ } }, 2000);
        }
      });
    } catch (e) { /* melhor esforço */ }
  }

  async function doSignup() {
    setErr(null); setMsg(null);
    if (!name.trim()) { setErr(T.errName); return; }
    if (pass.length < 6) { setErr(T.errShort); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password: pass,
      options: { data: { display_name: name.trim(), marketing_opt_in: optin } },
    });
    setBusy(false);
    if (error) { setErr(mapErr(error)); return; }
    pingCockpit();
    if (!data.session) setMsg(T.checkMail);
  }

  async function doLogin() {
    setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    setBusy(false);
    if (error) setErr(mapErr(error));
  }

  async function doReset() {
    setErr(null); setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: "https://tapedojo.school" });
    setBusy(false); setMsg(T.sent);
  }

  async function doLogout() {
    try { localStorage.removeItem("td:cloudName"); } catch (e) { /* ok */ }
    await supabase.auth.signOut();
  }

  const input = { width: "100%", fontSize: 17.5, padding: "13px 14px", borderRadius: 12, border: "2px solid " + C.grid, background: C.bg, color: C.text, marginBottom: 10 };
  const btn = { width: "100%", minHeight: 52, fontSize: 18, fontWeight: 800, borderRadius: 12, border: "none", cursor: "pointer" };

  if (!ready) {
    return <p style={{ color: C.muted, textAlign: "center", padding: 40, fontFamily: "Inter, system-ui, sans-serif" }}>{T.wait}</p>;
  }

  if (sess) {
    const nm = (sess.user.user_metadata && sess.user.user_metadata.display_name) || sess.user.email;
    return (
      <div>
        <div className="max-w-3xl mx-auto px-4" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, fontFamily: "Inter, system-ui, sans-serif" }}>
          <span style={{ color: C.muted, fontSize: 15, fontWeight: 700 }}>{T.hello} {nm}</span>
          <button onClick={doLogout} style={{ background: "none", border: "1px solid " + C.grid, color: C.muted, borderRadius: 10, fontSize: 14, fontWeight: 800, padding: "6px 12px", cursor: "pointer", minHeight: 38 }}>{T.out}</button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: C.text, display: "flex", justifyContent: "center", padding: "26px 16px" }}>
      <div style={{ background: C.surface, border: "2px solid " + C.grid, borderRadius: 18, maxWidth: 430, width: "100%", padding: 22 }}>
        <p style={{ fontSize: 26, fontWeight: 800, marginBottom: 2 }}>Tape<span style={{ color: C.orange }}>Dojo</span></p>
        <p style={{ fontWeight: 800, fontSize: 21, marginBottom: 4 }}>{T.title}</p>
        <p style={{ color: C.muted, fontSize: 16, marginBottom: 16 }}>{T.sub}</p>

        {mode === "signup" && (
          <div>
            <input style={input} placeholder={T.name} value={name} onChange={(e) => setName(e.target.value)} />
            <input style={input} type="email" placeholder={T.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={input} type="password" placeholder={T.pass} value={pass} onChange={(e) => setPass(e.target.value)} />
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: C.muted, fontSize: 15, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} style={{ marginTop: 4, width: 18, height: 18 }} />
              <span>{T.optin}</span>
            </label>
            <button onClick={doSignup} disabled={busy} style={{ ...btn, background: C.orange, color: "#231000", opacity: busy ? 0.6 : 1 }}>🥋 {T.make}</button>
            <button onClick={() => { setMode("login"); setErr(null); setMsg(null); }} style={{ ...btn, background: "none", color: C.muted, marginTop: 8, fontSize: 15.5 }}>{T.have}</button>
          </div>
        )}

        {mode === "login" && (
          <div>
            <input style={input} type="email" placeholder={T.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={input} type="password" placeholder={T.pass} value={pass} onChange={(e) => setPass(e.target.value)} />
            <button onClick={doLogin} disabled={busy} style={{ ...btn, background: C.buy, color: "#06220F", opacity: busy ? 0.6 : 1 }}>{T.enter}</button>
            <button onClick={() => { setMode("signup"); setErr(null); setMsg(null); }} style={{ ...btn, background: "none", color: C.muted, marginTop: 8, fontSize: 15.5 }}>{T.noacc}</button>
            <button onClick={() => { setMode("reset"); setErr(null); setMsg(null); }} style={{ ...btn, background: "none", color: C.muted, marginTop: 2, fontSize: 15.5 }}>{T.forgot}</button>
          </div>
        )}

        {mode === "reset" && (
          <div>
            <input style={input} type="email" placeholder={T.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={doReset} disabled={busy} style={{ ...btn, background: C.navy, color: "#fff", opacity: busy ? 0.6 : 1 }}>{T.reset}</button>
            <button onClick={() => { setMode("login"); setErr(null); setMsg(null); }} style={{ ...btn, background: "none", color: C.muted, marginTop: 8, fontSize: 15.5 }}>{T.have}</button>
          </div>
        )}

        {err && <p style={{ color: C.sell, fontWeight: 700, marginTop: 12, fontSize: 15.5 }}>{err}</p>}
        {msg && <p style={{ color: C.buy, fontWeight: 700, marginTop: 12, fontSize: 15.5 }}>{msg}</p>}
      </div>
    </div>
  );
}
