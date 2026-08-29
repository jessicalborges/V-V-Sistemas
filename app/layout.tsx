import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'V&V Sistemas - Gestão Inteligente & Controle',
  description: 'Sistema completo de gestão de estoque, PDV e clientes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0b1120] text-slate-100 min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}