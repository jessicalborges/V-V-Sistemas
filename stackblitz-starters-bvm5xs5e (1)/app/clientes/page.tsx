'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Estado para controlar a exibição do formulário de novo cliente
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Formulário de Cadastro Ampliado
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [limite, setLimite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [instagram, setInstagram] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Modais
  const [clienteEditando, setClienteEditando] = useState<any | null>(null);
  const [clienteQuitar, setClienteQuitar] = useState<any | null>(null);
  const [valorAbatimento, setValorAbatimento] = useState('');

  // Trata valores digitados com vírgula ou ponto para número válido
  const parseValorMonetario = (valor: any): number => {
    if (!valor) return 0;
    if (typeof valor === 'number') return valor;
    const limpo = String(valor).replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(limpo);
    return isNaN(parsed) ? 0 : parsed;
  };

  const carregarClientes = async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
    setClientes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limiteNum = parseValorMonetario(limite);

    const { error } = await supabase.from('clientes').insert([
      {
        nome,
        telefone,
        cpf_cnpj: cpf,
        limite_credito: limiteNum,
        saldo_devedor: 0,
        endereco,
        instagram,
        data_nascimento: dataNascimento || null,
        observacoes,
      },
    ]);

    if (error) {
      alert('Erro ao cadastrar cliente: ' + error.message);
    } else {
      alert('Cliente cadastrado com sucesso!');
      setNome('');
      setTelefone('');
      setCpf('');
      setLimite('');
      setEndereco('');
      setInstagram('');
      setDataNascimento('');
      setObservacoes('');
      setMostrarFormulario(false); // Esconde o formulário após cadastrar
      carregarClientes();
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEditando) return;

    const limiteCreditoParsed = parseValorMonetario(clienteEditando.limite_credito);
    const saldoDevedorParsed = parseValorMonetario(clienteEditando.saldo_devedor);

    const { error } = await supabase
      .from('clientes')
      .update({
        nome: clienteEditando.nome,
        telefone: clienteEditando.telefone,
        cpf_cnpj: clienteEditando.cpf_cnpj,
        limite_credito: limiteCreditoParsed,
        saldo_devedor: saldoDevedorParsed,
        endereco: clienteEditando.endereco,
        instagram: clienteEditando.instagram,
        data_nascimento: clienteEditando.data_nascimento || null,
        observacoes: clienteEditando.observacoes,
      })
      .eq('id', clienteEditando.id);

    if (error) {
      alert('Erro ao atualizar cadastro: ' + error.message);
    } else {
      alert('Cadastro do cliente atualizado com sucesso!');
      setClienteEditando(null);
      carregarClientes();
    }
  };

  const handleQuitarDivida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteQuitar) return;

    const valor = parseValorMonetario(valorAbatimento);

    if (valor <= 0) {
      return alert('Informe um valor de pagamento válido maior que zero.');
    }

    const saldoAtual = parseValorMonetario(clienteQuitar.saldo_devedor);
    const novoSaldo = Math.max(0, saldoAtual - valor);

    const { error } = await supabase
      .from('clientes')
      .update({ saldo_devedor: novoSaldo })
      .eq('id', clienteQuitar.id);

    if (error) {
      alert('Erro ao abater valor: ' + error.message);
    } else {
      alert(`Abatimento de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} registrado com sucesso!`);
      setClienteQuitar(null);
      setValorAbatimento('');
      carregarClientes();
    }
  };

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await supabase.from('clientes').delete().eq('id', id);
      carregarClientes();
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Clientes & Crediário</h1>

        {/* BOTÃO QUE EXIBE / ESCONDE O FORMULÁRIO */}
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer text-sm shadow-md"
        >
          {mostrarFormulario ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {/* FORMULÁRIO COMPLETO (SÓ APARECE QUANDO "mostrarFormulario" FOR TRUE) */}
      {mostrarFormulario && (
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl mb-8 shadow-md transition-all">
          <h2 className="text-lg font-bold text-indigo-400 mb-4">Cadastrar Novo Cliente</h2>
          <form onSubmit={handleCadastrar} className="space-y-4">
            {/* LINHA 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">CPF / CNPJ:</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Limite Crediário (R$):</label>
                <input
                  type="text"
                  value={limite}
                  onChange={(e) => setLimite(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* LINHA 2 (INFORMAÇÕES ADICIONAIS) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1">Endereço Completo:</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Instagram (@):</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@nomedocliente"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Data de Nascimento:</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* OBSERVATIVOS */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Observações / Preferências:</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Prefere roupas tamanho M, gosta de perfumes florais..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-5 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Cadastrar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABELA DE CLIENTES */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold">Clientes Cadastrados</h2>
          <input
            type="text"
            placeholder="Pesquisar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Carregando lista...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">NOME</th>
                  <th className="p-3">TELEFONE / INSTAGRAM</th>
                  <th className="p-3">LIMITE</th>
                  <th className="p-3">A PAGAR (FIADO)</th>
                  <th className="p-3 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clientesFiltrados.map((c) => {
                  const saldoDevedor = parseValorMonetario(c.saldo_devedor);
                  const limiteCredito = parseValorMonetario(c.limite_credito);

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{c.nome}</div>
                        {c.endereco && <div className="text-[11px] text-slate-400">{c.endereco}</div>}
                      </td>
                      <td className="p-3 text-xs">
                        <div className="text-slate-300">{c.telefone || '-'}</div>
                        {c.instagram && <div className="text-indigo-400 text-[11px]">{c.instagram}</div>}
                      </td>
                      
                      <td className="p-3 whitespace-nowrap font-medium text-slate-200">
                        R$ {limiteCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className={`p-3 whitespace-nowrap font-bold ${saldoDevedor > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="p-3 text-center flex justify-center gap-2 whitespace-nowrap">
                        {saldoDevedor > 0 && (
                          <button
                            onClick={() => setClienteQuitar(c)}
                            className="text-emerald-400 hover:text-emerald-300 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Quitar / Abater
                          </button>
                        )}
                        <button
                          onClick={() => setClienteEditando(c)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(c.id)}
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
        )}
      </div>

      {/* MODAL DE EDITAR CADASTRO */}
      {clienteEditando && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Editar Cadastro do Cliente</h3>
            <form onSubmit={handleSalvarEdicao} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={clienteEditando.nome || ''}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={clienteEditando.telefone || ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={clienteEditando.cpf_cnpj || ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, cpf_cnpj: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Limite Crediário (R$)</label>
                  <input
                    type="text"
                    value={clienteEditando.limite_credito ?? ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, limite_credito: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Saldo Devedor (R$)</label>
                  <input
                    type="text"
                    value={clienteEditando.saldo_devedor ?? ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, saldo_devedor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={clienteEditando.endereco || ''}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, endereco: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={clienteEditando.instagram || ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, instagram: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={clienteEditando.data_nascimento || ''}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, data_nascimento: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Observações</label>
                <input
                  type="text"
                  value={clienteEditando.observacoes || ''}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, observacoes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setClienteEditando(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs rounded-lg font-semibold text-white cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE QUITAR/ABATER DÍVIDA */}
      {clienteQuitar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Abater Dívida de Fiado</h3>
            <p className="text-xs text-slate-400 mb-4">
              Cliente: <span className="text-white font-bold">{clienteQuitar.nome}</span>
              <br />
              Dívida Atual: <span className="text-amber-400 font-bold">R$ {parseValorMonetario(clienteQuitar.saldo_devedor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>

            <form onSubmit={handleQuitarDivida} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Valor Pago (R$):</label>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={valorAbatimento}
                  onChange={(e) => setValorAbatimento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setClienteQuitar(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs rounded-lg font-semibold text-white cursor-pointer"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}