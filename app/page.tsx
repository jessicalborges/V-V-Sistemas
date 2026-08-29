'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from './supabase'

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null)
  const [historico, setHistorico] = useState([
    { remetente: 'bot', texto: 'Olá! Sou o Assistente V&V. Como posso ajudar você hoje com dúvidas ou relatos de erros?' }
  ])

  useEffect(() => {
    obterUsuarioLogado()
  }, [])

  const obterUsuarioLogado = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      setUsuarioEmail(user.email)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUsuarioEmail(null)
  }

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensagem.trim()) return

    const novaMensagem = mensagem
    setHistorico((prev) => [...prev, { remetente: 'user', texto: novaMensagem }])
    setMensagem('')

    setTimeout(() => {
      setHistorico((prev) => [
        ...prev,
        {
          remetente: 'bot',
          texto: 'Obrigado pelo contato! Sua mensagem/relato foi registrado e nossa equipe de suporte vai analisar.'
        }
      ])
    }, 1000)
  }

  const nomeUsuario = usuarioEmail ? usuarioEmail.split('@')[0] : null

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Menu Lateral */}
      <aside className={`w-64 border-r p-4 flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
              V&V
            </div>
            <div>
              <h2 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>V-V Sistemas</h2>
              <p className="text-xs text-slate-400">Gestão Inteligente</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white">
              <span>📊</span> Visão Geral
            </Link>
            <Link href="/pdv" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>🛒</span> PDV (Vendas)
            </Link>
            <Link href="/clientes" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>👥</span> Clientes & Crediário
            </Link>
            <Link href="/estoque" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>📦</span> Inventário / Estoque
            </Link>
            <Link href="/movimentacoes" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>📈</span> Movimentações
            </Link>
            <Link href="/financeiro" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>💰</span> Financeiro & Caixa
            </Link>
            <Link href="/relatorios" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>📋</span> Relatórios
            </Link>
          </nav>
        </div>

        <div className={`pt-4 border-t space-y-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Alternar Tema */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-400">Modo Escuro</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg transition font-medium"
            >
              Alternar
            </button>
          </div>

          {/* Exibição do Usuário Logado ou Botão de Login */}
          {nomeUsuario ? (
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Operador Logado</span>
                <span className="text-sm font-bold text-blue-400 truncate block capitalize">{nomeUsuario}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold border transition ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}>
              <span>🔑</span> Acessar Login
            </Link>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Sistema Online
            </span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 space-y-8 relative">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Visão Geral do Estoque 📊
          </h1>

          {/* Indicador de Usuário Superior */}
          {nomeUsuario && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>
              <span className="text-xs text-slate-400">Usuário:</span>
              <span className="text-xs font-bold text-white capitalize">{nomeUsuario}</span>
            </div>
          )}
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`border p-4 rounded-xl space-y-2 ${darkMode ? 'bg-slate-900 border-red-500/30' : 'bg-white border-red-200 shadow-sm'}`}>
            <span className="text-xs text-slate-400 font-semibold uppercase">PRODUTOS CRÍTICOS</span>
            <p className="text-2xl font-bold text-red-500">2 <span className="text-xs text-slate-400">itens</span></p>
          </div>
          <div className={`border p-4 rounded-xl space-y-2 ${darkMode ? 'bg-slate-900 border-yellow-500/30' : 'bg-white border-yellow-200 shadow-sm'}`}>
            <span className="text-xs text-slate-400 font-semibold uppercase">A RECEBER (CREDIÁRIO)</span>
            <p className="text-2xl font-bold text-yellow-500">R$ 687,70</p>
          </div>
          <div className={`border p-4 rounded-xl space-y-2 ${darkMode ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-blue-200 shadow-sm'}`}>
            <span className="text-xs text-slate-400 font-semibold uppercase">CUSTO INVESTIDO</span>
            <p className="text-2xl font-bold text-blue-500">R$ 21.610,90</p>
          </div>
          <div className={`border p-4 rounded-xl space-y-2 ${darkMode ? 'bg-slate-900 border-green-500/30' : 'bg-white border-green-200 shadow-sm'}`}>
            <span className="text-xs text-slate-400 font-semibold uppercase">LUCRO ESTIMADO</span>
            <p className="text-2xl font-bold text-green-500">R$ 43.407,20</p>
          </div>
        </div>

        {/* Grid de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/pdv" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">🛒</span>
            <h3 className="text-lg font-bold text-green-500 group-hover:text-green-400">Frente de Caixa (PDV)</h3>
            <p className="text-xs text-slate-400">Realizar vendas rápidas, emitir cupons e dar baixa de estoque.</p>
          </Link>

          <Link href="/clientes" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">👥</span>
            <h3 className="text-lg font-bold text-blue-500 group-hover:text-blue-400">Clientes & Crediário</h3>
            <p className="text-xs text-slate-400">Cadastrar clientes, gerenciar carnês e quitar dívidas de fiado.</p>
          </Link>

          <Link href="/estoque" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">📦</span>
            <h3 className="text-lg font-bold text-blue-500 group-hover:text-blue-400">Inventário de Produtos</h3>
            <p className="text-xs text-slate-400">Cadastrar novos itens, custos, fornecedores e atualizar estoque.</p>
          </Link>

          <Link href="/movimentacoes" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-bold text-yellow-500 group-hover:text-yellow-400">Movimentações</h3>
            <p className="text-xs text-slate-400">Histórico completo de entradas, saídas e movimentações do sistema.</p>
          </Link>

          <Link href="/financeiro" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">💰</span>
            <h3 className="text-lg font-bold text-purple-500 group-hover:text-purple-400">Financeiro & Caixa</h3>
            <p className="text-xs text-slate-400">Fluxo de caixa, fechamento diário, despesas e receitas.</p>
          </Link>

          <Link href="/relatorios" className={`border p-6 rounded-2xl hover:border-blue-500 transition space-y-3 group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-bold text-indigo-500 group-hover:text-indigo-400">Relatórios & Métricas</h3>
            <p className="text-xs text-slate-400">Visualizar histórico de vendas, faturamento total e operador.</p>
          </Link>
        </div>

        {/* Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          {chatOpen ? (
            <div className={`w-80 md:w-96 rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <span className="font-bold text-sm">Assistente V&V</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white hover:text-slate-200 font-bold">✕</button>
              </div>

              <div className="p-4 h-64 overflow-y-auto space-y-3 text-xs">
                {historico.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl max-w-[80%] ${msg.remetente === 'user' ? 'bg-blue-600 text-white' : darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                      {msg.texto}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={enviarMensagem} className={`p-3 border-t flex gap-2 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <input
                  type="text"
                  placeholder="Relate um erro ou faça uma dúvida..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition">
                  Enviar
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition font-bold text-sm"
            >
              <span>🤖</span>
              <span>Assistente V&V</span>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}