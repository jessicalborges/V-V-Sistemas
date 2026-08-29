'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Relatorios() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarRelatorio()
  }, [])

  const carregarRelatorio = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vendas')
      .select('*, clientes(nome)')
      .order('created_at', { ascending: false })

    if (data) setVendas(data)
    setLoading(false)
  }

  const totalFaturado = vendas.reduce((acc, v) => acc + Number(v.total || 0), 0)
  const totalVendas = vendas.length
  const ticketMedio = totalVendas > 0 ? totalFaturado / totalVendas : 0

  const imprimirRelatorio = () => {
    window.print()
  }

  const exportarCSV = () => {
    if (vendas.length === 0) {
      alert('Não há dados para exportar!')
      return
    }

    const cabecalho = ['Data/Hora', 'Operador', 'Cliente', 'Forma Pagamento', 'Total (R$)']
    const linhas = vendas.map((v) => [
      `"${new Date(v.created_at).toLocaleString('pt-BR')}"`,
      `"${v.usuario ? v.usuario.split('@')[0] : 'Sistema'}"`,
      `"${v.clientes?.nome || 'Cliente Avulso'}"`,
      `"${v.forma_pagamento || ''}"`,
      `"${Number(v.total).toFixed(2)}"`
    ])

    const conteudoCSV = [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n')
    const blob = new Blob(['\ufeff' + conteudoCSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Estilo CSS especial para Impressão / PDF */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, button, header, aside, .no-print {
            display: none !important;
          }
          .bg-slate-900, .bg-slate-950 {
            background-color: white !important;
            border: 1px solid #ccc !important;
            color: black !important;
          }
          .text-white, .text-slate-100, .text-slate-300, .text-slate-400 {
            color: black !important;
          }
          .text-green-400, .text-blue-400, .text-purple-400 {
            color: black !important;
            font-weight: bold !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios & Métricas</h1>
          <p className="text-slate-400 text-sm">Acompanhamento consolidado do desempenho de vendas.</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 no-print">
          <button
            onClick={carregarRelatorio}
            className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg border border-slate-700 transition"
          >
            🔄 Atualizar Dados
          </button>
          <button
            onClick={exportarCSV}
            className="bg-green-700 hover:bg-green-600 text-sm px-4 py-2 rounded-lg font-bold transition text-white"
          >
            📊 Exportar Excel/CSV
          </button>
          <button
            onClick={imprimirRelatorio}
            className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-2 rounded-lg font-bold transition text-white"
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Faturamento Total</span>
          <p className="text-3xl font-extrabold text-green-400">R$ {totalFaturado.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Qtd. de Vendas</span>
          <p className="text-3xl font-extrabold text-blue-400">{totalVendas}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tíquete Médio</span>
          <p className="text-3xl font-extrabold text-purple-400">R$ {ticketMedio.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Histórico das Últimas Vendas</h2>

        {loading ? (
          <p className="text-slate-400 text-sm">Carregando relatório...</p>
        ) : vendas.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma venda registrada até o momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(venda.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {venda.usuario ? venda.usuario.split('@')[0] : 'Sistema'}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {venda.clientes?.nome || 'Cliente Avulso'}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">
                      {venda.forma_pagamento?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-400">
                      R$ {Number(venda.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}