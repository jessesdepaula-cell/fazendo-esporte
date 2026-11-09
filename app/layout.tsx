import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fazendo Esporte | Gestão & Manutenção Inteligente",
  description: "Plataforma de chamados via QR Code com atendimento em até 24 horas para academias e condomínios. Fazendo Esporte - Gestão e Manutenção de Equipamentos Fitness.",
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-800 selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
