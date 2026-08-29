'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function PDV() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  // Dados do fechamento
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [valorPago, setValorPago] = useState('')
  const [parcelas, setParcelas] = useState(1)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    const { data: dataProdutos } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true })

    const { data: dataClientes } = await supabase
      .from('clientes')
      .select('id, nome')
      .order('nome', { ascending: true })

    if (dataProdutos) setProdutos(dataProdutos)
    if (dataClientes) setClientes(dataClientes)
    setLoading(false)
  }

  const adicionarAoCarrinho = (produto: any) => {
    const itemExistente = carrinho.find((item) => item.id === produto.id)
    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      )
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }])
    }
  }

  const alterarQuantidade = (id: any, delta: number) => {
    setCarrinho(
      carrinho
        .map((item) => {
          if (item.id === id) {
            const novaQtd = item.quantidade + delta
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removerDoCarrinho = (id: any) => {
    setCarrinho(carrinho.filter((item) => item.id !== id))
  }

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  const troco = parseFloat(valorPago) - total > 0 ? parseFloat(valorPago) - total : 0
  const valorParcela = total / parcelas

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Adicione ao menos um produto ao carrinho!')
      return
    }

    if (formaPagamento === 'crediario' && !clienteSelecionado) {
      alert('Selecione um cliente para realizar vendas no Crediário!')
      return
    }

    const { data: venda, error: errorVenda } = await supabase
      .from('vendas')
      .insert([
        {
          cliente_id: clienteSelecionado || null,
          forma_pagamento: formaPagamento,
          parcelas: ['cartao_credito', 'crediario'].includes(formaPagamento) ? parcelas : 1,
          total: total,
          valor_pago: parseFloat(valorPago) || total,
          troco: troco,
        },
      ])
      .select()

    if (errorVenda) {
      alert('Erro ao registrar venda: ' + errorVenda.message)
      return
    }

    if (venda && venda[0]) {
      const itensVenda = carrinho.map((item) => ({
        venda_id: venda[0].id,
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      }))

      await supabase.from('itens_venda').insert(itensVenda)
    }

    alert('Venda finalizada com sucesso!')
    setCarrinho([])
    setClienteSelecionado('')
    setValorPago('')
    setParcelas(1)
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100">
      {/* Produtos e Busca */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Caixa / PDV</h1>

        <input
          type="text"
          placeholder="Buscar produto por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />

        {loading ? (
          <p className="text-slate-400">Carregando produtos...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {produtosFiltrados.map((produto) => (
              <button
                key={produto.id}
                onClick={() => adicionarAoCarrinho(produto)}
                className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg border border-slate-700 text-left flex flex-col justify-between transition"
              >
                <span className="font-semibold text-sm line-clamp-2">{produto.nome}</span>
                <span className="text-green-400 font-bold mt-2">
                  R$ {Number(produto.preco).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrinho, Cliente, Pagamento e Resumo */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-between space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-3 border-b border-slate-700 pb-2">
            Carrinho de Compras
          </h2>

          {carrinho.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum produto adicionado.</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {carrinho.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm bg-slate-900 p-2 rounded-lg"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-medium truncate">{item.nome}</p>
                    <p className="text-xs text-slate-400">
                      R$ {Number(item.preco).toFixed(2)} x {item.quantidade}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => alterarQuantidade(item.id, -1)}
                      className="px-2 py-0.5 bg-slate-700 rounded text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs px-1">{item.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(item.id, 1)}
                      className="px-2 py-0.5 bg-slate-700 rounded text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removerDoCarrinho(item.id)}
                      className="text-red-400 hover:text-red-300 ml-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cliente */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">Cliente</label>
          <select
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none"
          >
            <option value="">Cliente Avulso (Não identificado)</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Pagamento */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Forma de Pagamento
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'pix', label: 'Pix' },
              { id: 'dinheiro', label: 'Dinheiro' },
              { id: 'cartao_credito', label: 'Crédito' },
              { id: 'cartao_debito', label: 'Débito' },
              { id: 'crediario', label: 'Crediário' },
            ].map((metodo) => (
              <button
                key={metodo.id}
                onClick={() => {
                  setFormaPagamento(metodo.id)
                  if (!['cartao_credito', 'crediario'].includes(metodo.id)) setParcelas(1)
                }}
                className={`p-2 rounded-lg border font-semibold text-xs transition ${
                  formaPagamento === metodo.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {metodo.label}
              </button>
            ))}
          </div>

          {/* Seleção de Parcelas */}
          {['cartao_credito', 'crediario'].includes(formaPagamento) && (
            <div className="pt-2">
              <label className="block text-xs text-slate-400 mb-1">Número de Parcelas</label>
              <select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}x de R$ {(total / num || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Troco */}
          {formaPagamento === 'dinheiro' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Valor Entregue</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Troco</label>
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-sm text-green-400 font-bold">
                  R$ {troco.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumo Final */}
        <div className="pt-2 border-t border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Total</span>
            <span className="text-2xl font-extrabold text-green-400">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={finalizarVenda}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}