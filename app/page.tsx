'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Menu Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
              V&V
            </div>
            <div>
              <h2 className="font-bold text-white text-base">V-V Sistemas</h2>
              <p className="text-xs text-slate-400">Gestão Inteligente</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white">
              <span>📊</span> Visão Geral
            </Link>
            <Link href="/pdv" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>🛒</span> PDV (Vendas)
            </Link>
            <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>👥</span> Clientes & Crediário
            </Link>
            <Link href="/estoque" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>📦</span> Inventário / Estoque
            </Link>
            <Link href="/movimentacoes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>📈</span> Movimentações
            </Link>
            <Link href="/financeiro" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>💰</span> Financeiro & Caixa
            </Link>
            <Link href="/relatorios" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <span>📋</span> Relatórios
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link href="/login" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <span>🔑</span> Acessar Login
          </Link>

          <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Sistema Online
            </span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Visão Geral do Estoque 📊
        </h1>

        {/* Cards Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">PRODUTOS CRÍTICOS</span>
            <p className="text-2xl font-bold text-red-500">2 <span className="text-xs text-slate-400">itens</span></p>
          </div>
          <div className="bg-slate-900 border border-yellow-500/30 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">A RECEBER (CREDIÁRIO)</span>
            <p className="text-2xl font-bold text-yellow-500">R$ 687,70</p>
          </div>
          <div className="bg-slate-900 border border-blue-500/30 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">CUSTO INVESTIDO</span>
            <p className="text-2xl font-bold text-blue-500">R$ 21.610,90</p>
          </div>
          <div className="bg-slate-900 border border-green-500/30 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">LUCRO ESTIMADO</span>
            <p className="text-2xl font-bold text-green-500">R$ 43.407,20</p>
          </div>
        </div>

        {/* Grid de Navegação Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/pdv" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">🛒</span>
            <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300">Frente de Caixa (PDV)</h3>
            <p className="text-xs text-slate-400">Realizar vendas rápidas, emitir cupons e dar baixa de estoque.</p>
          </Link>

          <Link href="/clientes" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">👥</span>
            <h3 className="text-lg font-bold text-blue-400 group-hover:text-blue-300">Clientes & Crediário</h3>
            <p className="text-xs text-slate-400">Cadastrar clientes, gerenciar carnês e quitar dívidas de fiado.</p>
          </Link>

          <Link href="/estoque" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">📦</span>
            <h3 className="text-lg font-bold text-blue-400 group-hover:text-blue-300">Inventário de Produtos</h3>
            <p className="text-xs text-slate-400">Cadastrar novos itens, custos, fornecedores e atualizar estoque.</p>
          </Link>

          <Link href="/movimentacoes" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-bold text-yellow-500 group-hover:text-yellow-400">Movimentações</h3>
            <p className="text-xs text-slate-400">Histórico completo de entradas, saídas e movimentações do sistema.</p>
          </Link>

          <Link href="/financeiro" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">💰</span>
            <h3 className="text-lg font-bold text-purple-400 group-hover:text-purple-300">Financeiro & Caixa</h3>
            <p className="text-xs text-slate-400">Fluxo de caixa, fechamento diário, despesas e receitas.</p>
          </Link>

          <Link href="/relatorios" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-bold text-indigo-400 group-hover:text-indigo-300">Relatórios & Métricas</h3>
            <p className="text-xs text-slate-400">Visualizar histórico de vendas, faturamento total e operador.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}