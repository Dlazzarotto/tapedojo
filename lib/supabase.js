"use client";
import { createClient } from "@supabase/supabase-js";

// Chave ANON: pública por design (o RLS do banco é quem protege os dados).
// A service_role — essa sim secreta — NUNCA entra no frontend.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdhhnmzmnjjwdxawuybt.supabase.co";
const KEY_ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaGhubXptbmpqd2R4YXd1eWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDU1NDIsImV4cCI6MjA5OTU4MTU0Mn0.rphau9ngzYvTNpf4BNmmeweCHmG2ekPGs2gBbRJvj00";

export const supabase = createClient(URL_, KEY_, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ── Sincronização do estado do dojo (chaves td:*) com a nuvem ──
// O TrainerCore continua lendo/gravando localStorage; cada gravação
// também sobe (com debounce) para td_state — e no login o estado da
// nuvem semeia o aparelho. Cross-device sem cirurgia no motor.
let CLOUD = {};
let timer = null;
let uid = null;

export async function seedCloud(session) {
  uid = session.user.id;
  try {
    const { data } = await supabase.from("td_state").select("data").eq("user_id", uid).maybeSingle();
    CLOUD = (data && data.data) || {};
    Object.keys(CLOUD).forEach((k) => {
      try { localStorage.setItem(k, JSON.stringify(CLOUD[k])); } catch (e) { /* cheio */ }
    });
  } catch (e) { CLOUD = {}; }
  if (typeof window !== "undefined") {
    window.__tdCloudPush = (key, val) => {
      if (!uid) return;
      CLOUD[key] = val;
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await supabase.from("td_state").upsert({ user_id: uid, data: CLOUD, updated_at: new Date().toISOString() });
        } catch (e) { /* melhor esforço */ }
      }, 900);
    };
  }
}

export function stopCloud() {
  uid = null;
  if (typeof window !== "undefined") window.__tdCloudPush = null;
}
