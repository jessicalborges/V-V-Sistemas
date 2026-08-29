import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'V-V Sistemas',
  description: 'Sistema ERP Gerencial e PDV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        {/* Barra de Navegação Principal */}
        <nav className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-white tracking-wide">
              V-V Sistemas
            </Link>

            <div className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/clientes" className="hover:text-blue-400 transition-colors">
                Clientes
              </Link>
              <Link href="/estoque" className="hover:text-blue-400 transition-colors">
                Estoque
              </Link>
              <Link href="/financeiro" className="hover:text-blue-400 transition-colors">
                Financeiro
              </Link>
              <Link href="/movimentacoes" className="hover:text-blue-400 transition-colors">
                Movimentações
              </Link>
              <Link href="/pdv" className="hover:text-blue-400 transition-colors">
                PDV
              </Link>
              <Link href="/relatorios" className="hover:text-blue-400 transition-colors">
                Relatórios
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  )
}