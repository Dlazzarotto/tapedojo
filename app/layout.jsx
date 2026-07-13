import "./globals.css";
import SWRegister from "@/components/SWRegister";

export const metadata = {
  title: "TapeDojo — Treine o olho. Leia o mercado.",
  description:
    "Treino deliberado de leitura de fluxo (order flow): drills com explicação do raciocínio, mercado ao vivo e a Série Mestres. Educacional — não é recomendação de investimento.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport = { themeColor: "#12143A" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
