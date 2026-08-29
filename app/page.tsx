'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

// Módulos
import EstoquePage from './estoque/page';
import ClientesPage from './clientes/page';
import PdvPage from './pdv/page';
import MovimentacoesPage from './movimentacoes/page';
import FinanceiroPage from './financeiro/page';

export default function HomePage() {
  const [abaAtual, setAbaAtual] = useState<'home' | 'pdv' | 'clientes' | 'estoque' | 'movimentacoes' | 'financeiro'>('home');
  const [modoEscuro, setModoEscuro] = useState(true);

  const [produtosCriticos, setProdutosCriticos] = useState(0);
  const [totalReceber, setTotalReceber] = useState(0);
  const [custoInvestido, setCustoInvestido] = useState(0);
  const [lucroEstimado, setLucroEstimado] = useState(0);
  const [chatAberto, setChatAberto] = useState(false);

  useEffect(() => {
    async function carregarMetricas() {
      const { data: produtos } = await supabase.from('produtos').select('*');
      if (produtos) {
        const criticos = produtos.filter((p: any) => Number(p.estoque_atual) <= 5).length;

        const custo = produtos.reduce((acc: number, p: any) => {
          const qtd = Number(p.estoque_atual) || 0;
          const c = Number(p.preco_custo) || 0;
          return acc + (qtd * c);
        }, 0);

        const venda = produtos.reduce((acc: number, p: any) => {
          const qtd = Number(p.estoque_atual) || 0;
          const v = Number(p.preco_venda ?? p.preco ?? 0);
          return acc + (qtd * v);
        }, 0);

        setProdutosCriticos(criticos);
        setCustoInvestido(custo);
        setLucroEstimado(venda - custo);
      }

      const { data: clientes } = await supabase.from('clientes').select('saldo_devedor');
      if (clientes) {
        const aReceber = clientes.reduce((acc: number, c: any) => acc + (Number(c.saldo_devedor) || 0), 0);
        setTotalReceber(aReceber);
      }
    }

    carregarMetricas();
  }, []);

  return (
    <div className={`flex min-h-screen transition-colors relative ${modoEscuro ? 'bg-[#0b1120] text-white' : 'bg-slate-100 text-slate-900'}`}>
      {/* BARRA LATERAL */}
      <aside className={`w-64 border-r p-5 flex flex-col justify-between shrink-0 min-h-screen ${modoEscuro ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20">
              V&V
            </div>
            <div>
              <h1 className={`text-base font-bold ${modoEscuro ? 'text-white' : 'text-slate-900'}`}>V&V Sistemas</h1>
              <p className="text-[10px] text-slate-400">Gestão Inteligente</p>
            </div>
          </div>

          {/* MENUS DE NAVEGAÇÃO */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setAbaAtual('home')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'home'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📊</span> Visão Geral
            </button>
            <button
              onClick={() => setAbaAtual('pdv')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'pdv'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🛒</span> PDV (Vendas)
            </button>
            <button
              onClick={() => setAbaAtual('clientes')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'clientes'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>👥</span> Clientes & Crediário
            </button>
            <button
              onClick={() => setAbaAtual('estoque')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'estoque'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📦</span> Inventário / Estoque
            </button>
            <button
              onClick={() => setAbaAtual('movimentacoes')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'movimentacoes'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📈</span> Movimentações
            </button>
            <button
              onClick={() => setAbaAtual('financeiro')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                abaAtual === 'financeiro'
                  ? 'bg-indigo-600 text-white'
                  : modoEscuro ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>💰</span> Financeiro & Caixa
            </button>
          </nav>
        </div>

        {/* PARTE INFERIOR DA BARRA LATERAL */}
        <div className="space-y-2 mt-auto">
          <button
            onClick={() => setModoEscuro(!modoEscuro)}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
              modoEscuro
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{modoEscuro ? '🌙 Modo Escuro' : '☀️ Modo Claro'}</span>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">Alternar</span>
          </button>

          <div className={`px-3 py-2.5 rounded-xl text-xs flex items-center gap-2 ${modoEscuro ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Online
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        {/* BARRA DE NAVEGAÇÃO SUPERIOR COM BOTÃO DE VOLTAR QUANDO EM UM MÓDULO */}
        {abaAtual !== 'home' && (
          <div className={`mb-6 flex justify-between items-center p-4 rounded-xl border ${modoEscuro ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <button
              onClick={() => setAbaAtual('home')}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm cursor-pointer transition-colors"
            >
              ← Voltar para a Visão Geral
            </button>
            <span className="text-xs text-slate-400 font-medium">V&V Sistemas</span>
          </div>
        )}

        {abaAtual === 'home' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              Visão Geral do Estoque 📊
            </h2>

            {/* CARDS DE MÉTRICAS CLICÁVEIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div
                onClick={() => setAbaAtual('estoque')}
                className={`p-4 rounded-2xl border-l-4 border-l-red-500 border ${
                  modoEscuro ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
                } shadow-md cursor-pointer transition-all transform hover:-translate-y-1`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase">Produtos Críticos</p>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-extrabold text-red-500">{produtosCriticos}</span>
                  <span className="text-xs font-bold text-slate-400">itens</span>
                </div>
              </div>

              <div
                onClick={() => setAbaAtual('clientes')}
                className={`p-4 rounded-2xl border-l-4 border-l-amber-500 border ${
                  modoEscuro ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
                } shadow-md cursor-pointer transition-all transform hover:-translate-y-1`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase">A Receber (Crediário)</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-2">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div
                onClick={() => setAbaAtual('estoque')}
                className={`p-4 rounded-2xl border-l-4 border-l-blue-500 border ${
                  modoEscuro ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
                } shadow-md cursor-pointer transition-all transform hover:-translate-y-1`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase">Custo Investido</p>
                <p className="text-2xl font-extrabold text-blue-400 mt-2">
                  R$ {custoInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div
                onClick={() => setAbaAtual('financeiro')}
                className={`p-4 rounded-2xl border-l-4 border-l-emerald-500 border ${
                  modoEscuro ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50'
                } shadow-md cursor-pointer transition-all transform hover:-translate-y-1`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase">Lucro Estimado</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                  R$ {lucroEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* TODOS OS 5 CARDS DE ATALHOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setAbaAtual('pdv')}
                className={`p-6 rounded-2xl border shadow-md cursor-pointer transition-all ${
                  modoEscuro ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2 block">🛒</span>
                <h3 className="text-lg font-bold text-emerald-400">Frente de Caixa (PDV)</h3>
                <p className="text-xs text-slate-400 mt-1">Realizar vendas rápidas, emitir cupons e dar baixa de estoque.</p>
              </div>

              <div
                onClick={() => setAbaAtual('clientes')}
                className={`p-6 rounded-2xl border shadow-md cursor-pointer transition-all ${
                  modoEscuro ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2 block">👥</span>
                <h3 className="text-lg font-bold text-indigo-400">Clientes & Crediário</h3>
                <p className="text-xs text-slate-400 mt-1">Cadastrar clientes, gerenciar carnês e quitar dívidas de fiado.</p>
              </div>

              <div
                onClick={() => setAbaAtual('estoque')}
                className={`p-6 rounded-2xl border shadow-md cursor-pointer transition-all ${
                  modoEscuro ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2 block">📦</span>
                <h3 className="text-lg font-bold text-blue-400">Inventário de Produtos</h3>
                <p className="text-xs text-slate-400 mt-1">Cadastrar novos itens, custos, fornecedores e atualizar estoque.</p>
              </div>

              <div
                onClick={() => setAbaAtual('movimentacoes')}
                className={`p-6 rounded-2xl border shadow-md cursor-pointer transition-all ${
                  modoEscuro ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2 block">📈</span>
                <h3 className="text-lg font-bold text-amber-400">Movimentações</h3>
                <p className="text-xs text-slate-400 mt-1">Histórico completo de entradas, saídas e movimentações do sistema.</p>
              </div>

              <div
                onClick={() => setAbaAtual('financeiro')}
                className={`p-6 rounded-2xl border shadow-md cursor-pointer transition-all ${
                  modoEscuro ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2 block">💰</span>
                <h3 className="text-lg font-bold text-purple-400">Financeiro & Caixa</h3>
                <p className="text-xs text-slate-400 mt-1">Fluxo de caixa, fechamento diário, despesas e receitas.</p>
              </div>
            </div>
          </div>
        )}

        {abaAtual === 'pdv' && <PdvPage />}
        {abaAtual === 'clientes' && <ClientesPage />}
        {abaAtual === 'estoque' && <EstoquePage />}
        {abaAtual === 'movimentacoes' && <MovimentacoesPage />}
        {abaAtual === 'financeiro' && <FinanceiroPage />}
      </main>

      {/* ASSISTENTE IA FLUTUANTE */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatAberto ? (
          <button
            onClick={() => setChatAberto(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-5 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer border border-indigo-400/30"
          >
            <span className="text-xl">🤖</span>
            <span className="text-sm">Assistente V&V</span>
          </button>
        ) : (
          <div className={`border w-80 h-96 rounded-2xl shadow-2xl flex flex-col p-4 ${modoEscuro ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className={`flex justify-between items-center border-b pb-2 mb-3 ${modoEscuro ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <span className={`font-bold text-sm ${modoEscuro ? 'text-white' : 'text-slate-900'}`}>Assistente V&V IA</span>
              </div>
              <button
                onClick={() => setChatAberto(false)}
                className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-xs space-y-2 text-slate-300">
              <div className={`p-2.5 rounded-xl border ${modoEscuro ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                Olá! Como posso ajudar na gestão da sua loja hoje?
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Digite sua dúvida..."
                className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${modoEscuro ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}