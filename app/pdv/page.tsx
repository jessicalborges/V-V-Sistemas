'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function PDV() {
  const [clientes, setClientes] = useState<any[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [valorPago, setValorPago] = useState('')
  const [total, setTotal] = useState(150.00)

  useEffect(() => {
    async function carregarClientes() {
      const { data } = await supabase.from('clientes').select('id, nome')
      if (data) setClientes(data)
    }
    carregarClientes()
  }, [])

  const troco = parseFloat(valorPago) - total > 0 ? parseFloat(valorPago) - total : 0

  const finalizarVenda = async () => {
    const { error } = await supabase.from('vendas').insert([
      {
        cliente_id: clienteSelecionado || null,
        forma_pagamento: formaPagamento,
        total: total,
        valor_pago: parseFloat(valorPago) || total,
        troco: troco
      }
    ])

    if (error) {
      alert('Erro ao finalizar venda: ' + error.message)
    } else {
      alert('Venda finalizada com sucesso!')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Caixa / PDV</h1>
      
      {/* Seleção de Cliente */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-2">
        <label className="block text-sm font-medium">Cliente</label>
        <select 
          value={clienteSelecionado} 
          onChange={(e) => setClienteSelecionado(e.target.value)}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
        >
          <option value="">Cliente Avulso (Não identificado)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Forma de Pagamento */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <label className="block text-sm font-medium">Forma de Pagamento</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'].map((metodo) => (
            <button
              key={metodo}
              onClick={() => setFormaPagamento(metodo)}
              className={`p-3 rounded-lg border font-semibold uppercase text-xs ${
                formaPagamento === metodo 
                  ? 'bg-blue-600 border-blue-400 text-white' 
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              {metodo.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Campo de Dinheiro / Troco */}
        {formaPagamento === 'dinheiro' && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs mb-1">Valor Entregue</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Troco</label>
              <div className="p-2 bg-slate-900 border border-slate-700 rounded text-green-400 font-bold">
                R$ {troco.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resumo e Botão Finalizar */}
      <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-sm text-slate-400">Total da Compra</span>
          <div className="text-3xl font-extrabold text-green-400">R$ {total.toFixed(2)}</div>
        </div>
        <button 
          onClick={finalizarVenda}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg"
        >
          Finalizar Venda
        </button>
      </div>
    </div>
  )
}