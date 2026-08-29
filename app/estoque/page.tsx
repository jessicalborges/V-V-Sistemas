'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroSegmento, setFiltroSegmento] = useState('Todos');
  const [abaEstoque, setAbaEstoque] = useState<'produtos' | 'pedidos'>('produtos');

  // Modais
  const [produtoEditando, setProdutoEditando] = useState<any | null>(null);
  const [produtoPedido, setProdutoPedido] = useState<any | null>(null);

  // Campos do Pedido (Auditoria)
  const [qtdPedido, setQtdPedido] = useState('10');
  const [solicitante, setSolicitante] = useState('Operador V&V');

  // Formulário de Cadastro
  const [nome, setNome] = useState('');
  const [segmento, setSegmento] = useState('Roupas');
  const [estoqueAtual, setEstoqueAtual] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [genero, setGenero] = useState('Feminino');
  const [volume, setVolume] = useState('100ml');
  const [whatsapp, setWhatsapp] = useState('');

  const carregarDados = async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('produtos').select('*').order('nome', { ascending: true });
    const { data: peds } = await supabase.from('pedidos_compra').select('*').order('created_at', { ascending: false });

    setProdutos(prods || []);
    setPedidos(peds || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Ajuste Rápido de Estoque (+ / -)
  const handleAlterarEstoque = async (id: string, estoqueAtualQtd: number, delta: number) => {
    const novaQtd = Math.max(0, estoqueAtualQtd + delta);
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, estoque_atual: novaQtd } : p)));

    const { error } = await supabase.from('produtos').update({ estoque_atual: novaQtd }).eq('id', id);
    if (error) {
      alert('Erro ao atualizar: ' + error.message);
      carregarDados();
    }
  };

  // Registrar Pedido de Reposição (Auditoria)
  const handleCriarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoPedido) return;

    const novoPedido = {
      produto_id: produtoPedido.id,
      nome_produto: produtoPedido.nome,
      quantidade: Number(qtdPedido),
      solicitante,
      status: 'Pendente',
    };

    const { error } = await supabase.from('pedidos_compra').insert([novoPedido]);

    if (error) {
      alert('Erro ao registrar pedido: ' + error.message);
    } else {
      alert(`Pedido de ${qtdPedido} un de "${produtoPedido.nome}" registrado com sucesso!`);
      setProdutoPedido(null);
      carregarDados();
    }
  };

  // Cadastro de Novo Produto
  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const pVenda = Number(precoVenda.replace(',', '.'));
    const pCusto = Number(precoCusto.replace(',', '.'));

    const { error } = await supabase.from('produtos').insert([{
      nome,
      segmento,
      estoque_atual: Number(estoqueAtual),
      preco_custo: pCusto,
      preco_venda: pVenda,
      preco: pVenda,
      genero,
      volume,
      whatsapp_fornecedor: whatsapp,
    }]);

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      alert('Produto cadastrado com sucesso!');
      setNome('');
      setEstoqueAtual('');
      setPrecoCusto('');
      setPrecoVenda('');
      setWhatsapp('');
      carregarDados();
    }
  };

  // Salvar Edição
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;

    const pVenda = Number(String(produtoEditando.preco_venda ?? produtoEditando.preco).replace(',', '.'));
    const pCusto = Number(String(produtoEditando.preco_custo).replace(',', '.'));

    const { error } = await supabase.from('produtos').update({
      nome: produtoEditando.nome,
      segmento: produtoEditando.segmento,
      estoque_atual: Number(produtoEditando.estoque_atual),
      preco_custo: pCusto,
      preco_venda: pVenda,
      preco: pVenda,
    }).eq('id', produtoEditando.id);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else {
      alert('Produto atualizado!');
      setProdutoEditando(null);
      carregarDados();
    }
  };

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await supabase.from('produtos').delete().eq('id', id);
      carregarDados();
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const atendeBusca = p.nome?.toLowerCase().includes(busca.toLowerCase());
    const atendeSegmento = filtroSegmento === 'Todos' || p.segmento === filtroSegmento;
    return atendeBusca && atendeSegmento;
  });

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Inventário</h1>
          <p className="text-xs text-slate-400">Controle de estoque, pedidos e auditoria</p>
        </div>

        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAbaEstoque('produtos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              abaEstoque === 'produtos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 Produtos
          </button>
          <button
            onClick={() => setAbaEstoque('pedidos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              abaEstoque === 'pedidos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Pedidos & Auditoria ({pedidos.length})
          </button>
        </div>
      </div>

      {abaEstoque === 'produtos' ? (
        <>
          {/* FORMULÁRIO DE NOVO PRODUTO */}
          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl mb-8 shadow-md">
            <h2 className="text-lg font-bold text-indigo-400 mb-4">+ Novo Produto</h2>
            <form onSubmit={handleCadastrar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome:</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Segmento:</label>
                <select
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Roupas">Roupas</option>
                  <option value="Perfumaria">Perfumaria</option>
                  <option value="Geral">Geral</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Estoque Inicial:</label>
                <input
                  type="number"
                  required
                  value={estoqueAtual}
                  onChange={(e) => setEstoqueAtual(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Custo (R$):</label>
                <input
                  type="text"
                  required
                  value={precoCusto}
                  onChange={(e) => setPrecoCusto(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Venda (R$):</label>
                <input
                  type="text"
                  required
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp Fornecedor:</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="md:col-span-3 mt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>

          {/* TABELA DE PRODUTOS */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-lg font-bold">Produtos Cadastrados</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <select
                  value={filtroSegmento}
                  onChange={(e) => setFiltroSegmento(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Todos">Todos</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Perfumaria">Perfumaria</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">PRODUTO</th>
                    <th className="p-3">AJUSTE RÁPIDO</th>
                    <th className="p-3">ESTADO</th>
                    <th className="p-3">CUSTO</th>
                    <th className="p-3">VENDA</th>
                    <th className="p-3 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {produtosFiltrados.map((p) => {
                    const eCritico = Number(p.estoque_atual) <= 5;
                    return (
                      <tr key={p.id}>
                        <td className="p-3 font-semibold text-white">{p.nome}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-max">
                            <button
                              onClick={() => handleAlterarEstoque(p.id, Number(p.estoque_atual), -1)}
                              className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-extrabold text-white text-sm px-2">{p.estoque_atual}</span>
                            <button
                              onClick={() => handleAlterarEstoque(p.id, Number(p.estoque_atual), 1)}
                              className="w-6 h-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          {eCritico ? (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              ⚠️ Crítico
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="p-3">R$ {Number(p.preco_custo || 0).toFixed(2)}</td>
                        <td className="p-3 text-emerald-400 font-bold">R$ {Number(p.preco_venda ?? p.preco ?? 0).toFixed(2)}</td>
                        <td className="p-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => setProdutoPedido(p)}
                            className="text-amber-400 hover:text-amber-300 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + Pedido
                          </button>
                          <button
                            onClick={() => setProdutoEditando(p)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(p.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ABA DE AUDITORIA DE PEDIDOS */
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Auditoria & Histórico de Pedidos</h2>
          {pedidos.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum pedido de reposição realizado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">DATA & HORA</th>
                    <th className="p-3">PRODUTO</th>
                    <th className="p-3">QTD PEDIDA</th>
                    <th className="p-3">SOLICITANTE (QUEM PEDIU)</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pedidos.map((ped) => {
                    const dataFormatada = new Date(ped.created_at).toLocaleString('pt-BR');
                    return (
                      <tr key={ped.id}>
                        <td className="p-3 text-xs text-slate-400 font-mono">{dataFormatada}</td>
                        <td className="p-3 font-bold text-white">{ped.nome_produto}</td>
                        <td className="p-3 text-amber-400 font-extrabold">{ped.quantidade} un</td>
                        <td className="p-3 font-semibold text-indigo-300">{ped.solicitante}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {ped.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE NOVO PEDIDO COM AUDITORIA */}
      {produtoPedido && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">📥 Solicitado Pedido de Reposição</h3>
            <p className="text-xs text-slate-400 mb-4">Produto: <span className="text-white font-bold">{produtoPedido.nome}</span></p>

            <form onSubmit={handleCriarPedido} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quantidade Desejada:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qtdPedido}
                  onChange={(e) => setQtdPedido(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Quem Solicitou (Auditoria):</label>
                <input
                  type="text"
                  required
                  value={solicitante}
                  onChange={(e) => setSolicitante(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProdutoPedido(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs rounded-lg font-semibold text-white cursor-pointer"
                >
                  Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {produtoEditando && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Editar Produto</h3>
            <form onSubmit={handleSalvarEdicao} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={produtoEditando.nome || ''}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estoque</label>
                  <input
                    type="number"
                    value={produtoEditando.estoque_atual ?? ''}
                    onChange={(e) => setProdutoEditando({ ...produtoEditando, estoque_atual: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preço Venda (R$)</label>
                  <input
                    type="text"
                    value={produtoEditando.preco_venda ?? produtoEditando.preco ?? ''}
                    onChange={(e) => setProdutoEditando({ ...produtoEditando, preco_venda: e.target.value, preco: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProdutoEditando(null)}
                  className="px-4 py-2 bg-slate-800 text-xs rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-xs rounded-lg text-white cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}