import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIGO | Gestão de Oficina",
  description:
    "Painel administrativo do SIGO para gestao de clientes, veiculos, servicos e funcionarios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${jakartaSans.variable} ${geistMono.variable} min-h-screen bg-slate-100 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
