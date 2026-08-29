'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function PDV() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [clienteId, setClienteId] = useState<string>('')
  const [formaPagamento, setFormaPagamento] = useState<string>('dinheiro')
  const [parcelas, setParcelas] = useState<number>(1)
  const [valorPago, setValorPago] = useState<string>('')
  const [busca, setBusca] = useState<string>('')
  const [usuarioEmail, setUsuarioEmail] = useState<string>('Operador')

  useEffect(() => {
    carregarDados()
    obterUsuario()
  }, [])

  const obterUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      setUsuarioEmail(user.email)
    }
  }

  const carregarDados = async () => {
    const { data: prodData } = await supabase.from('produtos').select('*')
    if (prodData) setProdutos(prodData)

    const { data: cliData } = await supabase.from('clientes').select('*')
    if (cliData) setClientes(cliData)
  }

  const adicionarAoCarrinho = (produto: any) => {
    const itemExistente = carrinho.find((item) => item.id === produto.id)
    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
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
  const numValorPago = parseFloat(valorPago.replace(',', '.')) || 0
  const troco = numValorPago > total ? numValorPago - total : 0

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('O carrinho está vazio!')
      return
    }

    if (formaPagamento === 'dinheiro' && numValorPago < total) {
      alert('O valor pago é menor que o total da compra!')
      return
    }

    try {
      // Ajuste de fuso horário para Brasília (UTC-3)
      const dataAtual = new Date()
      const dataBrasil = new Date(dataAtual.getTime() - (3 * 60 * 60 * 1000)).toISOString()

      const { data: venda, error: erroVenda } = await supabase
        .from('vendas')
        .insert([
          {
            cliente_id: clienteId ? clienteId : null,
            forma_pagamento: formaPagamento,
            parcelas: parcelas,
            total: total,
            valor_pago: numValorPago,
            troco: troco,
            usuario: usuarioEmail,
            created_at: dataBrasil
          }
        ])
        .select()
        .single()

      if (erroVenda) throw erroVenda

      const itensParaInserir = carrinho.map((item) => ({
        venda_id: venda.id,
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        created_at: dataBrasil
      }))

      const { error: erroItens } = await supabase
        .from('itens_venda')
        .insert(itensParaInserir)

      if (erroItens) throw erroItens

      alert('Venda realizada com sucesso!')
      setCarrinho([])
      setValorPago('')
      setClienteId('')
      setFormaPagamento('dinheiro')
      setParcelas(1)
    } catch (error: any) {
      alert('Erro ao registrar venda: ' + error.message)
    }
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col md:flex-row gap-6">
      {/* Área da Esquerda: Busca e Produtos */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {produtosFiltrados.map((prod) => (
            <div
              key={prod.id}
              onClick={() => adicionarAoCarrinho(prod)}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-4 rounded-xl cursor-pointer transition flex flex-col justify-between space-y-2"
            >
              <div>
                <h3 className="font-bold text-white text-sm">{prod.nome}</h3>
                <p className="text-xs text-slate-400">Estoque: {prod.estoque ?? 0}</p>
              </div>
              <p className="text-green-400 font-bold">R$ {Number(prod.preco).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Área da Direita: Carrinho e Fechamento */}
      <div className="w-full md:w-96 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-white">Carrinho de Compras</h2>
            <span className="text-xs text-slate-400">Operador: {usuarioEmail.split('@')[0]}</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {carrinho.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum item adicionado.</p>
            ) : (
              carrinho.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg text-sm">
                  <div>
                    <p className="font-medium text-white">{item.nome}</p>
                    <p className="text-xs text-slate-400">R$ {Number(item.preco).toFixed(2)} x {item.quantidade}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => alterarQuantidade(item.id, -1)}
                      className="bg-slate-800 hover:bg-slate-700 px-2 rounded text-slate-300"
                    >
                      -
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(item.id, 1)}
                      className="bg-slate-800 hover:bg-slate-700 px-2 rounded text-slate-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removerDoCarrinho(item.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">CLIENTE</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200"
              >
                <option value="">Cliente Avulso / Não Informado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">FORMA DE PAGAMENTO</label>
              <div className="grid grid-cols-2 gap-2">
                {['dinheiro', 'pix', 'credito', 'debito', 'crediario'].map((forma) => (
                  <button
                    key={forma}
                    type="button"
                    onClick={() => setFormaPagamento(forma)}
                    className={`py-2 text-xs font-semibold rounded-lg capitalize border transition ${
                      formaPagamento === forma
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {forma}
                  </button>
                ))}
              </div>
            </div>

            {formaPagamento === 'dinheiro' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor Entregue</label>
                  <input
                    type="text"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Troco</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-bold text-green-400">
                    R$ {troco.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span className="text-green-400">R$ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={finalizarVenda}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}