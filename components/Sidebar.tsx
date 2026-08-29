'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ darkMode, setDarkMode, nomeUsuario, handleLogout }: any) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Visão Geral', icon: '📊' },
    { href: '/pdv', label: 'PDV (Vendas)', icon: '🛒', destaque: true },
    { href: '/clientes', label: 'Clientes & Crediário', icon: '👥' },
    { href: '/estoque', label: 'Inventário / Estoque', icon: '📦' },
    { href: '/movimentacoes', label: 'Movimentações', icon: '🔄' },
    { href: '/financeiro', label: 'Relatórios Financeiros', icon: '📈' },
  ];

  return (
    <aside
      className={`w-64 p-6 flex flex-col justify-between border-r ${
        darkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 text-white font-black px-3 py-1.5 rounded-xl text-lg shadow-md">
            V&V
          </div>
          <h1 className="font-bold text-xl tracking-wide">Sistemas</h1>
        </div>

        <div
          className={`p-3 mb-4 rounded-2xl border text-xs ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-400 block mb-0.5">Operador Logado:</span>
          <span className="font-bold text-indigo-400 block truncate">👤 {nomeUsuario}</span>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full p-2.5 mb-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            darkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>

        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  ativo
                    ? link.destaque
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : link.destaque
                    ? 'text-emerald-400 hover:bg-emerald-800/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl font-bold text-xs transition-all mb-4"
        >
          🚪 Sair da Conta
        </button>
        <div className="text-xs text-slate-500 text-center">V&V Sistemas v2.0</div>
      </div>
    </aside>
  );
}