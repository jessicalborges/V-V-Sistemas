'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Visão Geral', href: '/', icon: '📊' },
    { name: 'PDV (Vendas)', href: '/pdv', icon: '🛒' },
    { name: 'Clientes & Crediário', href: '/clientes', icon: '👥' },
    { name: 'Inventário / Estoque', href: '/estoque', icon: '📦' },
    { name: 'Movimentações', href: '/movimentacoes', icon: '📈' },
    { name: 'Financeiro & Caixa', href: '/financeiro', icon: '💰' },
    { name: 'Relatórios', href: '/relatorios', icon: '📋' },
  ]

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen p-4 text-slate-100">
      <div className="space-y-6">
        {/* Logo / Cabeçalho */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
            V&V
          </div>
          <div>
            <h2 className="font-bold text-white text-base">V-V Sistemas</h2>
            <p className="text-xs text-slate-400">Gestão Inteligente</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Botão de Login / Rodapé */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          href="/login"
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition border ${
            pathname === '/login'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>🔑</span>
          <span>Acessar Login</span>
        </Link>

        <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sistema Online
          </span>
        </div>
      </div>
    </aside>
  )
}