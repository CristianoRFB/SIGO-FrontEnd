"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataTable } from "@/components/ui/DataTable";
import { situacaoOptions, sexoOptions, tipoClienteOptions } from "@/lib/constants";
import { Cliente } from "@/types/entities";
import { deleteCliente, listClientes, createCliente, getCliente, updateCliente } from "@/services/clientes";


export function ClientesSection() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalEditingId, setModalEditingId] = useState<number | null>(null);
  const initialModalForm = {
    Nome: "",
    Email: "",
    senha: "",
    Cpf_Cnpj: "",
    DataNasc: new Date().toISOString().slice(0,10),
    Sexo: 1,
    TipoCliente: 1,
    Situacao: 1,
    Cidade: "",
    Estado: "",
    Rua: "",
    Numero: 0,
    Bairro: "",
    Cep: 0,
    Pais: "",
    Complemento: "",
    Razao: "",
    Obs: "",
  };
  const [modalForm, setModalForm] = useState(initialModalForm);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listClientes();
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      console.log(data);
      setClientes(data);
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }


  

  async function handleDelete(cliente: Cliente) {
    if (!window.confirm(`Deseja remover o cliente ${cliente.Nome}?`)) {
      return;
    }
    try {
      await deleteCliente(cliente.Id);
      setFeedback("Cliente removido com sucesso.");
      await refresh();
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível remover o cliente.");
    }
  }

  async function handleModalSubmit(event: React.FormEvent) {
    event.preventDefault();
    setModalSubmitting(true);
    setFeedback(null);
    const payload: Partial<Cliente> = {
      Nome: modalForm.Nome,
      Email: modalForm.Email,
      Cpf_Cnpj: modalForm.Cpf_Cnpj,
      DataNasc: modalForm.DataNasc,
      Sexo: modalForm.Sexo,
      TipoCliente: modalForm.TipoCliente,
      Situacao: modalForm.Situacao,
      Cidade: modalForm.Cidade,
      Estado: modalForm.Estado,
      Senha: modalForm.senha,
      Rua: modalForm.Rua,
      Numero: modalForm.Numero,
      Bairro: modalForm.Bairro,
      Cep: modalForm.Cep,
      Pais: modalForm.Pais,
      Complemento: modalForm.Complemento,
      Razao: modalForm.Razao,
      Obs: modalForm.Obs,
    };
    try {
      if (modalEditingId) {
        await updateCliente(modalEditingId, payload);
        setFeedback("Cliente atualizado com sucesso.");
      } else {
        await createCliente(payload);
        setFeedback("Cliente cadastrado com sucesso.");
      }
      await refresh();
      setShowModal(false);
    } catch (err) {
      //console.error(err);
      setFeedback("Erro ao salvar o cliente.");
    } finally {
      setModalSubmitting(false);
    }
  }

  const filteredClientes = useMemo(() => {
    if (!search.trim()) {
      return clientes;
    }
    const term = search.toLowerCase();
    return clientes.filter((cliente) =>
      [
        cliente.Nome,
        cliente.Email,
        cliente.Cidade,
        cliente.Estado,
        cliente.Cpf_Cnpj,
      ]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(term))
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clientes"
        description="Cadastre novos clientes, gerencie dados e acompanhe a situação."
        actionSlot={
          <div className="flex items-center gap-3">
            <div>
              <button
                type="button"
                onClick={() => {
                  setModalEditingId(null);
                  setModalForm(initialModalForm);
                  setShowModal(true);
                }}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Cadastrar Aluno
              </button>
            </div>
            <div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, CPF ou cidade"
                className="w-64 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        }
      />

      {feedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <DataTable
            data={filteredClientes}
            columns={[
              { header: "Nome", key: "Nome" },
              { header: "E-mail", key: "Email" },
              { header: "Cidade", key: "Cidade" },
              { header: "Estado", key: "Estado", width: "80px" },
              {
                header: "Situação",
                key: "Situacao",
                render: (item: Cliente) => (
                  <span className={`badge ${item.Situacao === 1 ? "badge-success" : "badge-warning"}`}>
                    {situacaoOptions.find((option) => option.value === item.Situacao)?.label}
                  </span>
                ),
              },
              {
                header: "Ações",
                key: "Id",
                render: (item: Cliente) => (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const data = await getCliente(item.Id);
                          if (data) {
                            setModalForm({
                              Nome: data.Nome ?? "",
                              Email: data.Email ?? "",
                              senha: "",
                              Cpf_Cnpj: data.Cpf_Cnpj ?? "",
                              DataNasc: data.DataNasc?.slice(0,10) ?? new Date().toISOString().slice(0,10),
                              Sexo: data.Sexo ?? 1,
                              TipoCliente: data.TipoCliente ?? 1,
                              Situacao: data.Situacao ?? 1,
                              Cidade: data.Cidade ?? "",
                              Estado: data.Estado ?? "",
                              Rua: data.Rua ?? "",
                              Numero: data.Numero ?? 0,
                              Bairro: data.Bairro ?? "",
                              Cep: data.Cep ?? 0,
                              Pais: data.Pais ?? "",
                              Complemento: data.Complemento ?? "",
                              Razao: data.Razao ?? "",
                              Obs: data.Obs ?? "",
                            });
                            setModalEditingId(item.Id);
                            setShowModal(true);
                          }
                        } catch (err) {
                          //console.error(err);
                          setFeedback("Não foi possível carregar os dados do cliente.");
                        }
                      }}
                      className="rounded-lg border border-blue-200 px-3 py-1 font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg border border-rose-200 px-3 py-1 font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Remover
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage={loading ? "Carregando clientes..." : "Nenhum cliente encontrado"}
            getRowId={(cliente) => cliente.Id}
          />
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{modalEditingId ? 'Editar' : 'Novo'} Cliente</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{modalEditingId ? 'Atualize as informações' : 'Preencha os dados'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <form className="mt-0 space-y-4 px-6 py-4 overflow-y-auto" id="cliente-form" onSubmit={handleModalSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome completo</label>
                <input
                  required
                  value={modalForm.Nome}
                  onChange={(e) => setModalForm((p) => ({ ...p, Nome: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">E-mail</label>
                <input
                  required
                  type="email"
                  value={modalForm.Email}
                  onChange={(e) => setModalForm((p) => ({ ...p, Email: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CPF / CNPJ</label>
                  <input
                    required
                    value={modalForm.Cpf_Cnpj}
                    onChange={(e) => setModalForm((p) => ({ ...p, Cpf_Cnpj: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Data de nascimento</label>
                  <input
                    type="date"
                    value={modalForm.DataNasc}
                    onChange={(e) => setModalForm((p) => ({ ...p, DataNasc: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Tipo de cliente</label>
                  <select
                    value={modalForm.TipoCliente}
                    onChange={(e) => setModalForm((p) => ({ ...p, TipoCliente: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {tipoClienteOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Sexo</label>
                  <select
                    value={modalForm.Sexo}
                    onChange={(e) => setModalForm((p) => ({ ...p, Sexo: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {sexoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Situação</label>
                  <select
                    value={modalForm.Situacao}
                    onChange={(e) => setModalForm((p) => ({ ...p, Situacao: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {situacaoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Cidade</label>
                  <input
                    value={modalForm.Cidade}
                    onChange={(e) => setModalForm((p) => ({ ...p, Cidade: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Estado</label>
                  <input
                    value={modalForm.Estado}
                    onChange={(e) => setModalForm((p) => ({ ...p, Estado: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400">Senha</label>
                <input
                  type="password"
                  value={modalForm.senha}
                  onChange={(e) => setModalForm((p) => ({ ...p, senha: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400">Rua</label>
                <input
                  value={modalForm.Rua}
                  onChange={(e) => setModalForm((p) => ({ ...p, Rua: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Número</label>
                  <input
                    type="number"
                    value={modalForm.Numero}
                    onChange={(e) => setModalForm((p) => ({ ...p, Numero: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Bairro</label>
                  <input
                    value={modalForm.Bairro}
                    onChange={(e) => setModalForm((p) => ({ ...p, Bairro: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CEP</label>
                  <input
                    type="number"
                    value={modalForm.Cep}
                    onChange={(e) => setModalForm((p) => ({ ...p, Cep: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">País</label>
                  <input
                    value={modalForm.Pais}
                    onChange={(e) => setModalForm((p) => ({ ...p, Pais: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Complemento</label>
                  <input
                    value={modalForm.Complemento}
                    onChange={(e) => setModalForm((p) => ({ ...p, Complemento: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Razão social / Apelido</label>
                  <input
                    value={modalForm.Razao}
                    onChange={(e) => setModalForm((p) => ({ ...p, Razao: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Observações</label>
                  <input
                    value={modalForm.Obs}
                    onChange={(e) => setModalForm((p) => ({ ...p, Obs: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </form>
            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" form="cliente-form" disabled={modalSubmitting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{modalSubmitting ? 'Salvando...' : modalEditingId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
