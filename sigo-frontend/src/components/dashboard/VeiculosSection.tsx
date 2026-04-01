"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { statusVeiculoOptions } from "@/lib/constants";
import { ApiError } from "@/services/api-client";
import { Cliente, Veiculo } from "@/types/entities";
import { listClientes } from "@/services/clientes";
import {
  createVeiculo,
  deleteVeiculo,
  listVeiculos,
  updateVeiculo,
} from "@/services/veiculos";

interface FormState {
  NomeVeiculo: string;
  TipoVeiculo: string;
  PlacaVeiculo: string;
  ChassiVeiculo: string;
  AnoFab: string;
  Quilometragem: string;
  Combustivel: string;
  Seguro: string;
  Cor: string;
  ClienteId: string;
  CorId: string;
  Situacao: string;
}

const initialForm: FormState = {
  NomeVeiculo: "",
  TipoVeiculo: "",
  PlacaVeiculo: "",
  ChassiVeiculo: "",
  AnoFab: String(new Date().getFullYear()),
  Quilometragem: "0",
  Combustivel: "Gasolina",
  Seguro: "Ativo",
  Cor: "",
  ClienteId: "",
  CorId: "0",
  Situacao: "0",
};

function resolveStatus(value: number) {
  return statusVeiculoOptions.find((option) => option.value === value)?.label ?? "-";
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

export function VeiculosSection() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const [veiculosList, clientesList] = await Promise.all([
        listVeiculos(),
        listClientes(),
      ]);
      setVeiculos(veiculosList);
      setClientes(clientesList);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar os veiculos."));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      ...initialForm,
      ClienteId: clientes[0] ? String(clientes[0].Id) : "",
    });
    setEditingId(null);
    setShowModal(false);
  }

  function openModalForCreate() {
    if (clientes.length === 0) {
      setFeedback("Cadastre pelo menos um cliente antes de cadastrar um veiculo.");
      return;
    }

    resetForm();
    setShowModal(true);
  }

  function populateForm(veiculo: Veiculo) {
    setEditingId(veiculo.Id);
    setForm({
      NomeVeiculo: veiculo.NomeVeiculo ?? "",
      TipoVeiculo: veiculo.TipoVeiculo ?? "",
      PlacaVeiculo: veiculo.PlacaVeiculo ?? "",
      ChassiVeiculo: veiculo.ChassiVeiculo ?? "",
      AnoFab: String(veiculo.AnoFab ?? new Date().getFullYear()),
      Quilometragem: String(veiculo.Quilometragem ?? 0),
      Combustivel: veiculo.Combustivel ?? "",
      Seguro: veiculo.Seguro ?? "",
      Cor: veiculo.Cor ?? "",
      ClienteId: String(veiculo.ClienteId ?? ""),
      CorId: String(veiculo.CorId ?? 0),
      Situacao: String(veiculo.Status ?? veiculo.Situacao ?? 0),
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.ClienteId) {
      setFeedback("Selecione um cliente para vincular o veiculo.");
      return;
    }

    if (!form.Cor.trim()) {
      setFeedback("Informe a cor do veiculo.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Veiculo> = {
      NomeVeiculo: form.NomeVeiculo,
      TipoVeiculo: form.TipoVeiculo,
      PlacaVeiculo: form.PlacaVeiculo,
      ChassiVeiculo: form.ChassiVeiculo,
      AnoFab: Number(form.AnoFab) || new Date().getFullYear(),
      Quilometragem: Number(form.Quilometragem) || 0,
      Combustivel: form.Combustivel,
      Seguro: form.Seguro,
      Cor: form.Cor.trim(),
      ClienteId: Number(form.ClienteId),
      CorId: Number(form.CorId) || 0,
      Status: Number(form.Situacao),
      Situacao: Number(form.Situacao),
    };

    try {
      if (editingId) {
        await updateVeiculo(editingId, payload);
        setFeedback("Veiculo atualizado com sucesso.");
      } else {
        await createVeiculo(payload);
        setFeedback("Veiculo cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel salvar o veiculo."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(veiculo: Veiculo) {
    if (!window.confirm(`Remover o veiculo ${veiculo.NomeVeiculo}?`)) {
      return;
    }

    try {
      await deleteVeiculo(veiculo.Id);
      setFeedback("Veiculo removido com sucesso.");
      await refresh();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel remover o veiculo."));
    }
  }

  function getClienteNome(clienteId: number) {
    return clientes.find((cliente) => cliente.Id === clienteId)?.Nome ?? `#${clienteId}`;
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return veiculos;
    }

    const term = search.toLowerCase();

    return veiculos.filter((item) =>
      [
        item.NomeVeiculo,
        item.TipoVeiculo,
        item.PlacaVeiculo,
        item.Cor,
        getClienteNome(item.ClienteId),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [veiculos, search, clientes]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Veiculos"
        description="Gerencie os veiculos cadastrados conforme o backend atual."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Novo veiculo
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por placa, modelo, cor ou cliente"
              className="w-80 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        }
      />

      {clientes.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nenhum cliente cadastrado. Cadastre um cliente antes de criar um veiculo.
        </div>
      )}

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      <DataTable
        data={filtered}
        columns={[
          { header: "Veiculo", key: "NomeVeiculo" },
          { header: "Placa", key: "PlacaVeiculo", width: "120px" },
          {
            header: "Cliente",
            key: "ClienteId",
            render: (item: Veiculo) => getClienteNome(item.ClienteId),
          },
          { header: "Cor", key: "Cor" },
          {
            header: "Status",
            key: "Status",
            render: (item: Veiculo) => (
              <span
                className={`badge ${
                  (item.Status ?? item.Situacao ?? 0) === 3 ? "badge-success" : "badge-warning"
                }`}
              >
                {resolveStatus(item.Status ?? item.Situacao ?? 0)}
              </span>
            ),
          },
          {
            header: "Acoes",
            key: "Id",
            render: (item: Veiculo) => (
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => populateForm(item)}
                  className="rounded-lg border border-emerald-200 px-3 py-1 font-medium text-emerald-600 hover:bg-emerald-50"
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
        emptyMessage={loading ? "Carregando veiculos..." : "Nenhum veiculo encontrado"}
        getRowId={(item) => item.Id}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {editingId ? "Editar" : "Novo"} Veiculo
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId ? "Atualize os dados" : "Preencha os dados"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                Fechar
              </button>
            </div>
            <form id="veiculo-form" className="mt-0 space-y-4 overflow-y-auto px-6 py-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome / Modelo</label>
                <input
                  required
                  value={form.NomeVeiculo}
                  onChange={(event) => setForm((prev) => ({ ...prev, NomeVeiculo: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Placa</label>
                  <input
                    required
                    value={form.PlacaVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, PlacaVeiculo: event.target.value.toUpperCase() }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Chassi</label>
                  <input
                    value={form.ChassiVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, ChassiVeiculo: event.target.value.toUpperCase() }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Tipo</label>
                  <input
                    value={form.TipoVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, TipoVeiculo: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Ano fabricacao</label>
                  <input
                    type="number"
                    value={form.AnoFab}
                    onChange={(event) => setForm((prev) => ({ ...prev, AnoFab: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Quilometragem</label>
                  <input
                    type="number"
                    value={form.Quilometragem}
                    onChange={(event) => setForm((prev) => ({ ...prev, Quilometragem: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Combustivel</label>
                  <input
                    value={form.Combustivel}
                    onChange={(event) => setForm((prev) => ({ ...prev, Combustivel: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Seguro</label>
                  <input
                    value={form.Seguro}
                    onChange={(event) => setForm((prev) => ({ ...prev, Seguro: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Cor</label>
                  <input
                    required
                    value={form.Cor}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cor: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Cliente</label>
                  <select
                    required
                    value={form.ClienteId}
                    onChange={(event) => setForm((prev) => ({ ...prev, ClienteId: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.Id} value={cliente.Id}>
                        {cliente.Nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CorId</label>
                  <input
                    type="number"
                    value={form.CorId}
                    onChange={(event) => setForm((prev) => ({ ...prev, CorId: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">Status</label>
                  <select value={form.Situacao} onChange={(event) => setForm((prev) => ({ ...prev, Situacao: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm">
                    {statusVeiculoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" form="veiculo-form" disabled={submitting || clientes.length === 0} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
