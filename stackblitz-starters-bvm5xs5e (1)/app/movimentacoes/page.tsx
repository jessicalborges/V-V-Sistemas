'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [detalheMov, setDetalheMov] = useState<any | null>(null);

  // Modal para nova movimentação manual
  const [modalMov, setModalMov] = useState<{
    aberto: boolean;
    produto: any | null;
    tipo: 'entrada' | 'saida';
    qtd: string;
  }>({ aberto: false, produto: null, tipo: 'entrada', qtd: '1' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data: dataMov } = await supabase
      .from('movimentacoes')
      .select('*')
      .order('id', { ascending: false });
    if (dataMov) setMovimentacoes(dataMov);

    const { data: dataProd } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');
    if (dataProd) setProdutos(dataProd);
  };

  const obterDataHoraLocalIso = () => {
    const agora = new Date();
    const offsetMs = agora.getTimezoneOffset() * 60000;
    const dataLocal = new Date(agora.getTime() - offsetMs);
    return dataLocal.toISOString().slice(0, 19).replace('T', ' ');
  };

  const formatarDataHoraBr = (dataIso: string) => {
    if (!dataIso) return '-';
    try {
      const d = new Date(dataIso);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dataIso;
    }
  };

  const confirmarMovimentacaoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMov.produto || !modalMov.qtd) return;

    const qtdNum = Math.abs(Number(modalMov.qtd)) || 0;
    if (qtdNum <= 0) return;

    const produto = modalMov.produto;
    const novoEstoqueCalc =
      modalMov.tipo === 'entrada'
        ? produto.estoque_atual + qtdNum
        : Math.max(0, produto.estoque_atual - qtdNum);

    let statusAtualizado = produto.status;
    if (novoEstoqueCalc === 0) statusAtualizado = 'critico';
    else if (novoEstoqueCalc <= 3) statusAtualizado = 'atencao';

    await supabase
      .from('produtos')
      .update({ estoque_atual: novoEstoqueCalc, status: statusAtualizado })
      .eq('id', produto.id);

    await supabase.from('movimentacoes').insert([
      {
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: modalMov.tipo,
        quantidade: qtdNum,
        operador: 'Ajuste Manual Estoque',
        data_movimentacao: obterDataHoraLocalIso(),
      },
    ]);

    setModalMov({ aberto: false, produto: null, tipo: 'entrada', qtd: '1' });
    carregarDados();
  };

  const estornarMovimentacao = async (mov: any) => {
    if (
      !confirm(
        `Deseja realmente estornar esta movimentação de ${mov.quantidade}x ${mov.produto_nome}? O produto retornará ao estoque.`
      )
    ) {
      return;
    }

    try {
      const { data: prodData } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', mov.produto_id)
        .single();

      if (!prodData) return alert('Produto não encontrado no cadastro atual.');

      const quantidade = Number(mov.quantidade) || 0;
      let novoEstoque =
        mov.tipo === 'saida'
          ? prodData.estoque_atual + quantidade
          : Math.max(0, prodData.estoque_atual - quantidade);

      let statusAtualizado = prodData.status;
      if (novoEstoque === 0) statusAtualizado = 'critico';
      else if (novoEstoque <= 3) statusAtualizado = 'atencao';

      await supabase
        .from('produtos')
        .update({ estoque_atual: novoEstoque, status: statusAtualizado })
        .eq('id', prodData.id);

      const tipoEstorno = mov.tipo === 'saida' ? 'entrada' : 'saida';
      await supabase.from('movimentacoes').insert([
        {
          produto_id: prodData.id,
          produto_nome: prodData.nome,
          tipo: tipoEstorno,
          quantidade: quantidade,
          operador: `ESTORNO da mov. #${mov.id}`,
          data_movimentacao: obterDataHoraLocalIso(),
        },
      ]);

      alert('✅ Estorno realizado com sucesso!');
      carregarDados();
    } catch (err) {
      alert('Erro ao realizar estorno.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Histórico de Movimentações 🔄
        </h2>
        <button
          onClick={() =>
            setModalMov({
              aberto: true,
              produto: produtos[0] || null,
              tipo: 'entrada',
              qtd: '1',
            })
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md"
        >
          ➕ Nova Movimentação
        </button>
      </div>

      {movimentacoes.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-slate-800 bg-[#0f172a] text-slate-400">
          <p className="text-base font-bold">Nenhuma movimentação registrada ainda!</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] overflow-hidden shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Tipo</th>
                <th className="p-4">Produto</th>
                <th className="p-4">Quantidade</th>
                <th className="p-4">Operador / Origem</th>
                <th className="p-4">Data e Hora (BR)</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((m) => {
                const operadorCurto = m.operador ? m.operador.split(' ')[0] : 'Operador';
                const eVenda = m.operador && m.operador.includes('Venda');

                return (
                  <tr key={m.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          m.tipo === 'entrada'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {m.tipo === 'entrada' ? '⬇️ Entrada' : '⬆️ Saída'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm">{m.produto_nome}</td>
                    <td className="p-4 font-black text-sm">{m.quantidade} un</td>
                    <td className="p-4 text-xs">
                      <p className="font-bold text-indigo-400">👤 {operadorCurto}</p>
                      {eVenda && (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          🛒 Venda PDV
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-300 font-medium">
                      🕒 {formatarDataHoraBr(m.data_movimentacao)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetalheMov(m)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          title="Visualizar Detalhes Completos"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => estornarMovimentacao(m)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-900 rounded-lg text-xs font-bold transition-all border border-amber-500/30"
                          title="Estornar e Devolver ao Estoque"
                        >
                          🔄 Estornar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALHES DA MOVIMENTAÇÃO */}
      {detalheMov && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-slate-800 bg-[#0f172a] text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>📋 Detalhes da Operação</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-400 font-mono">
                  #{detalheMov.id}
                </span>
              </h3>
              <button onClick={() => setDetalheMov(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between border-b pb-2 border-slate-800/50">
                <span className="text-slate-400">Tipo de Operação:</span>
                <span className={`font-extrabold uppercase ${detalheMov.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {detalheMov.tipo === 'entrada' ? '⬇️ Entrada' : '⬆️ Saída'}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 border-slate-800/50">
                <span className="text-slate-400">Produto:</span>
                <span className="font-bold text-white">{detalheMov.produto_nome}</span>
              </div>

              <div className="flex justify-between border-b pb-2 border-slate-800/50">
                <span className="text-slate-400">Quantidade:</span>
                <span className="font-black text-amber-400">{detalheMov.quantidade} un</span>
              </div>

              <div className="flex justify-between border-b pb-2 border-slate-800/50">
                <span className="text-slate-400">Data e Hora Oficial (BR):</span>
                <span className="font-semibold text-slate-200">
                  🕒 {formatarDataHoraBr(detalheMov.data_movimentacao)}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block mb-1 font-bold">Informações Registradas do Registro / Venda:</span>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-200 font-mono text-[11px] leading-relaxed break-words">
                  {detalheMov.operador || 'Operador não informado'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setDetalheMov(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}

      {/* MODAL NOVA MOVIMENTAÇÃO */}
      {modalMov.aberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-slate-800 bg-[#0f172a] text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-3">🔄 Lançar Movimentação</h3>

            <form onSubmit={confirmarMovimentacaoManual}>
              <label className="block text-xs font-bold mb-1">Tipo de Operação:</label>
              <select
                value={modalMov.tipo}
                onChange={(e) =>
                  setModalMov({
                    ...modalMov,
                    tipo: e.target.value as 'entrada' | 'saida',
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm mb-3"
              >
                <option value="entrada">⬇️ Entrada no Estoque</option>
                <option value="saida">⬆️ Saída do Estoque</option>
              </select>

              <label className="block text-xs font-bold mb-1">Selecione o Produto:</label>
              <select
                value={modalMov.produto?.id || ''}
                onChange={(e) => {
                  const prodEncontrado = produtos.find(
                    (p) => p.id === Number(e.target.value)
                  );
                  setModalMov({
                    ...modalMov,
                    produto: prodEncontrado || null,
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm mb-3"
                required
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - {p.estoque_atual} un
                  </option>
                ))}
              </select>

              <label className="block text-xs font-bold mb-1">Quantidade de Unidades:</label>
              <input
                type="number"
                min="1"
                value={modalMov.qtd}
                onChange={(e) => setModalMov({ ...modalMov, qtd: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm mb-4"
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all ${
                    modalMov.tipo === 'entrada'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirmar {modalMov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMov({ aberto: false, produto: null, tipo: 'entrada', qtd: '1' })}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}