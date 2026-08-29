'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Geral');

  const carregarFinanceiro = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('financeiro')
      .select('*')
      .order('created_at', { ascending: false });
    setLancamentos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === 'receita')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === 'despesa')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const saldoCaixa = totalReceitas - totalDespesas;

  const handleCadastrarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();

    const novoLancamento = {
      descricao,
      tipo,
      valor: Number(valor.replace(',', '.')),
      categoria,
    };

    const { error } = await supabase.from('financeiro').insert([novoLancamento]);

    if (error) {
      alert('Erro ao cadastrar lançamento: ' + error.message);
    } else {
      alert('Lançamento realizado com sucesso!');
      setDescricao('');
      setValor('');
      carregarFinanceiro();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Financeiro & Fluxo de Caixa</h1>

      {/* RESUMO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl border-l-4 border-l-emerald-500 border border-slate-800 bg-[#0f172a] shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase">Entradas / Receitas</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            R$ {totalReceitas.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded-2xl border-l-4 border-l-red-500 border border-slate-800 bg-[#0f172a] shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase">Saídas / Despesas</p>
          <p className="text-2xl font-extrabold text-red-400 mt-2">
            R$ {totalDespesas.toFixed(2)}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border-l-4 border border-slate-800 bg-[#0f172a] shadow-md ${saldoCaixa >= 0 ? 'border-l-indigo-500' : 'border-l-amber-500'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase">Saldo em Caixa</p>
          <p className={`text-2xl font-extrabold mt-2 ${saldoCaixa >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
            R$ {saldoCaixa.toFixed(2)}
          </p>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl mb-8 shadow-md">
        <h2 className="text-lg font-bold text-purple-400 mb-4">+ Novo Lançamento</h2>
        <form onSubmit={handleCadastrarLancamento} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">Descrição:</label>
            <input
              type="text"
              required
              placeholder="Ex: Conta de Luz / Venda Balcão"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="despesa">Despesa (Saída)</option>
              <option value="receita">Receita (Entrada)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Valor (R$):</label>
            <input
              type="text"
              required
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-4 mt-2">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer text-sm"
            >
              Lançar no Caixa
            </button>
          </div>
        </form>
      </div>

      {/* TABELA */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Lançamentos do Caixa</h2>
        {loading ? (
          <p className="text-slate-400">Carregando lançamentos...</p>
        ) : lancamentos.length === 0 ? (
          <p className="text-slate-400">Nenhum lançamento registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lancamentos.map((l) => (
                  <tr key={l.id}>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(l.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-semibold text-white">{l.descricao}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${l.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {l.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className={`p-3 font-bold ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {l.tipo === 'receita' ? '+' : '-'} R$ {Number(l.valor).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}