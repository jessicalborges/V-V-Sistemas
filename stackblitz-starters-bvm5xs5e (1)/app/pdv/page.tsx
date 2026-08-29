'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

export default function PdvPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const carregarProdutos = async () => {
    setLoading(true);
    const { data } = await supabase.from('produtos').select('*').order('nome', { ascending: true });
    setProdutos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const adicionarAoCarrinho = (produto: any) => {
    const precoUnitario = Number(produto.preco_venda ?? produto.preco ?? 0);
    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque_atual) {
        return alert('Quantidade limite do estoque atingida!');
      }
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      );
    } else {
      setCarrinho([...carrinho, { ...produto, precoFinal: precoUnitario, quantidade: 1 }]);
    }
  };

  const alterarQuantidadeCarrinho = (id: string, delta: number) => {
    setCarrinho(
      carrinho
        .map((item) => {
          if (item.id === id) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + item.precoFinal * item.quantidade, 0);

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return alert('Seu carrinho está vazio!');

    for (const item of carrinho) {
      const novoEstoque = Math.max(0, item.estoque_atual - item.quantidade);
      await supabase.from('produtos').update({ estoque_atual: novoEstoque }).eq('id', item.id);
    }

    alert('Venda realizada com sucesso!');
    setCarrinho([]);
    carregarProdutos();
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* SEÇÃO DE SELEÇÃO DE PRODUTOS */}
      <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-white mb-4">Frente de Caixa (PDV)</h2>

        <input
          type="text"
          placeholder="Buscar produto pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white mb-6 focus:outline-none focus:border-indigo-500"
        />

        {loading ? (
          <p className="text-slate-400 text-sm">Carregando catálogo...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {produtosFiltrados.map((p) => {
              const precoExibicao = Number(p.preco_venda ?? p.preco ?? 0);
              return (
                <div
                  key={p.id}
                  className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-slate-700 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{p.nome}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Estoque: {p.estoque_atual}</p>
                    <p className="text-emerald-400 font-extrabold text-sm mt-1">
                      R$ {precoExibicao.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => adicionarAoCarrinho(p)}
                    disabled={p.estoque_atual <= 0}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CARRINHO DE COMPRAS */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Itens da Venda</h2>

          {carrinho.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Carrinho vazio</p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {carrinho.map((item) => (
                <div key={item.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white">{item.nome}</p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      R$ {(item.precoFinal * item.quantidade).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidadeCarrinho(item.id, -1)}
                      className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white">{item.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidadeCarrinho(item.id, 1)}
                      className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 text-sm font-bold">Total:</span>
            <span className="text-2xl font-black text-emerald-400">R$ {totalVenda.toFixed(2)}</span>
          </div>

          <button
            onClick={finalizarVenda}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm shadow-lg shadow-emerald-600/20"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
}