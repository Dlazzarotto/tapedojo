import { NextResponse } from "next/server";

// Detecta o país do visitante na borda da Vercel (header x-vercel-ip-country)
// e grava no cookie td-country — a vitrine de preços lê daí.
// Cobrança real (Fase 2) segue o país do cartão no checkout.
export function middleware(req) {
  const res = NextResponse.next();
  const country = req.headers.get("x-vercel-ip-country") || "";
  const cur = req.cookies.get("td-country");
  if (country && (!cur || cur.value !== country)) {
    res.cookies.set("td-country", country, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  return res;
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
