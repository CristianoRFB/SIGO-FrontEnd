"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataTable } from "@/components/ui/DataTable";
import { situacaoOptions, sexoOptions, tipoClienteOptions } from "@/lib/constants";
import { ApiError } from "@/services/api-client";
import { createCliente, deleteCliente, getCliente, listClientes, updateCliente } from "@/services/clientes";
import { Cliente } from "@/types/entities";

const initialModalForm = {
  Nome: "",
  Email: "",
  senha: "",
  Cpf_Cnpj: "",
  DataNasc: new Date().toISOString().slice(0, 10),
  Sexo: 1,
  TipoCliente: 1,
  Situacao: 1,
  Cidade: "",
  Estado: "",
  Rua: "",
  Numero: 0,
  Bairro: "",
  Cep: "",
  Pais: "",
  Complemento: "",
  razao: "",
  Obs: "",
};

type ClienteForm = typeof initialModalForm;

function toClienteForm(cliente: Cliente): ClienteForm {
  return {
    Nome: cliente.Nome ?? "",
    Email: cliente.Email ?? "",
    senha: "",
    Cpf_Cnpj: cliente.Cpf_Cnpj ?? "",
    DataNasc: cliente.DataNasc?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    Sexo: cliente.Sexo ?? 1,
    TipoCliente: cliente.TipoCliente ?? 1,
    Situacao: cliente.Situacao ?? 1,
    Cidade: cliente.Cidade ?? "",
    Estado: cliente.Estado ?? "",
    Rua: cliente.Rua ?? "",
    Numero: cliente.Numero ?? 0,
    Bairro: cliente.Bairro ?? "",
    Cep: cliente.Cep ?? "",
    Pais: cliente.Pais ?? "",
    Complemento: cliente.Complemento ?? "",
    razao: cliente.razao ?? "",
    Obs: cliente.Obs ?? "",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const apiMessage =
      error.response?.Message ??
      error.response?.message ??
      error.response?.title;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (error.status === 0) {
      return "Erro de rede ao conectar com a API. Verifique se o backend esta rodando em https://localhost:7241 e se o CORS/HTTPS local foi liberado.";
    }

    return `${fallback} (${error.message})`;
  }

  if (error instanceof Error && error.message.trim()) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
}

export function ClientesSection() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalEditingId, setModalEditingId] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState<ClienteForm>(initialModalForm);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listClientes();
      setClientes(data);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar os clientes."));
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalEditingId(null);
    setModalForm(initialModalForm);
    setShowModal(true);
  }

  async function openEditModal(clienteId: number) {
    try {
      const data = await getCliente(clienteId);

      if (!data) {
        setFeedback("Cliente nao encontrado.");
        return;
      }

      setModalForm(toClienteForm(data));
      setModalEditingId(clienteId);
      setShowModal(true);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar os dados do cliente."));
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
      setFeedback(getErrorMessage(error, "Nao foi possivel remover o cliente."));
    }
  }

  async function handleModalSubmit(event: React.FormEvent) {
    event.preventDefault();
    setModalSubmitting(true);
    setFeedback(null);

    const payload: Partial<Cliente> = {
      Nome: modalForm.Nome,
      Email: modalForm.Email,
      senha: modalForm.senha,
      Cpf_Cnpj: modalForm.Cpf_Cnpj,
      DataNasc: modalForm.DataNasc,
      Sexo: modalForm.Sexo,
      TipoCliente: modalForm.TipoCliente,
      Situacao: modalForm.Situacao,
      Cidade: modalForm.Cidade,
      Estado: modalForm.Estado,
      Rua: modalForm.Rua,
      Numero: modalForm.Numero,
      Bairro: modalForm.Bairro,
      Cep: modalForm.Cep,
      Pais: modalForm.Pais,
      Complemento: modalForm.Complemento,
      razao: modalForm.razao,
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
    } catch (error) {
      setFeedback(getErrorMessage(error, "Erro ao salvar o cliente."));
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
      [cliente.Nome, cliente.Email, cliente.Cidade, cliente.Estado, cliente.Cpf_Cnpj]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(term))
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clientes"
        description="Cadastre novos clientes, gerencie dados e acompanhe a situacao."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Novo cliente
            </button>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CPF ou cidade"
              className="w-64 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        }
      />

      {feedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedback}
        </div>
      )}

      <DataTable
        data={filteredClientes}
        columns={[
          { header: "Nome", key: "Nome" },
          { header: "E-mail", key: "Email" },
          { header: "Cidade", key: "Cidade" },
          { header: "Estado", key: "Estado", width: "80px" },
          {
            header: "Situacao",
            key: "Situacao",
            render: (item: Cliente) => (
              <span className={`badge ${item.Situacao === 1 ? "badge-success" : "badge-warning"}`}>
                {situacaoOptions.find((option) => option.value === item.Situacao)?.label}
              </span>
            ),
          },
          {
            header: "Acoes",
            key: "Id",
            render: (item: Cliente) => (
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => openEditModal(item.Id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {modalEditingId ? "Editar" : "Novo"} Cliente
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {modalEditingId ? "Atualize as informacoes" : "Preencha os dados"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Fechar
              </button>
            </div>

            <form
              id="cliente-form"
              className="mt-0 space-y-4 overflow-y-auto px-6 py-4"
              onSubmit={handleModalSubmit}
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome completo</label>
                <input
                  required
                  value={modalForm.Nome}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, Nome: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400">E-mail</label>
                <input
                  required
                  type="email"
                  value={modalForm.Email}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, Email: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CPF / CNPJ</label>
                  <input
                    required
                    value={modalForm.Cpf_Cnpj}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Cpf_Cnpj: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Data de nascimento</label>
                  <input
                    type="date"
                    value={modalForm.DataNasc}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, DataNasc: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Tipo de cliente</label>
                  <select
                    value={modalForm.TipoCliente}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, TipoCliente: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {tipoClienteOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Sexo</label>
                  <select
                    value={modalForm.Sexo}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Sexo: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {sexoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Situacao</label>
                  <select
                    value={modalForm.Situacao}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Situacao: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {situacaoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Cidade</label>
                  <input
                    value={modalForm.Cidade}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Cidade: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Estado</label>
                  <input
                    value={modalForm.Estado}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Estado: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400">Senha</label>
                <input
                  type="password"
                  value={modalForm.senha}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, senha: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400">Rua</label>
                <input
                  value={modalForm.Rua}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, Rua: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Numero</label>
                  <input
                    type="number"
                    value={modalForm.Numero}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Numero: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Bairro</label>
                  <input
                    value={modalForm.Bairro}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Bairro: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CEP</label>
                  <input
                    type="text"
                    value={modalForm.Cep}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Cep: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Pais</label>
                  <input
                    value={modalForm.Pais}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Pais: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Complemento</label>
                  <input
                    value={modalForm.Complemento}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Complemento: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Razao social / Apelido</label>
                  <input
                    value={modalForm.razao}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, razao: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Observacoes</label>
                  <input
                    value={modalForm.Obs}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, Obs: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </form>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="cliente-form"
                disabled={modalSubmitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {modalSubmitting ? "Salvando..." : modalEditingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
