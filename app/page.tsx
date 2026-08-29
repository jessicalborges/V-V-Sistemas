'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">V-V Sistemas</h1>
            <p className="text-slate-400 text-sm">Painel de Controle e Gestão ERP</p>
          </div>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Acessar / Login
          </Link>
        </div>

        {/* Módulos do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/clientes"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold group-hover:text-blue-400">Clientes</h2>
            <p className="text-slate-400 text-sm mt-2">Gerenciamento de cadastro de clientes.</p>
          </Link>

          <Link
            href="/estoque"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold group-hover:text-blue-400">Estoque</h2>
            <p className="text-slate-400 text-sm mt-2">Controle de produtos e preços.</p>
          </Link>

          <Link
            href="/pdv"
            className="bg-slate-900 border border-slate-800 hover:border-green-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold text-green-400 group-hover:text-green-300">Caixa / PDV</h2>
            <p className="text-slate-400 text-sm mt-2">Faturamento, clientes e formas de pagamento.</p>
          </Link>

          <Link
            href="/financeiro"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold group-hover:text-blue-400">Financeiro</h2>
            <p className="text-slate-400 text-sm mt-2">Contas a pagar, receber e fluxo de caixa.</p>
          </Link>

          <Link
            href="/movimentacoes"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold group-hover:text-blue-400">Movimentações</h2>
            <p className="text-slate-400 text-sm mt-2">Histórico de entradas e saídas.</p>
          </Link>

          <Link
            href="/relatorios"
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-xl transition group"
          >
            <h2 className="text-xl font-bold text-purple-400 group-hover:text-purple-300">Relatórios</h2>
            <p className="text-slate-400 text-sm mt-2">Resumo de vendas e métricas do sistema.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}