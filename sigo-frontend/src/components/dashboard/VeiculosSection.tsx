"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { statusVeiculoOptions } from "@/lib/constants";
import { ApiError } from "@/services/api-client";
import { extractApiMessage } from "@/services/errors";
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
    const apiMessage = extractApiMessage(error.response);

    if (apiMessage) {
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

  const clientesById = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.Id, cliente.Nome])),
    [clientes]
  );

  function getClienteNome(clienteId: number) {
    return clientesById.get(clienteId) ?? `#${clienteId}`;
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
        clientesById.get(item.ClienteId) ?? `#${item.ClienteId}`,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [veiculos, search, clientesById]);

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
              className="button-primary"
            >
              Novo veiculo
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por placa, modelo, cor ou cliente"
              className="toolbar-search w-80"
            />
          </div>
        }
      />

      {clientes.length === 0 && !loading && (
        <div className="feedback-warning">
          Nenhum cliente cadastrado. Cadastre um cliente antes de criar um veiculo.
        </div>
      )}

      {feedback && (
        <div className="feedback-success">
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
                  className="button-inline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="button-inline-danger"
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
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-2xl">
            <div className="modal-header">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">
                  {editingId ? "Editar" : "Novo"} Veiculo
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId ? "Atualize os dados" : "Preencha os dados"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="button-ghost">
                Fechar
              </button>
            </div>
            <form id="veiculo-form" className="modal-body" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">Nome / Modelo</label>
                <input
                  required
                  value={form.NomeVeiculo}
                  onChange={(event) => setForm((prev) => ({ ...prev, NomeVeiculo: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Placa</label>
                  <input
                    required
                    value={form.PlacaVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, PlacaVeiculo: event.target.value.toUpperCase() }))}
                    className="field-input mt-2 uppercase"
                  />
                </div>
                <div>
                  <label className="field-label">Chassi</label>
                  <input
                    value={form.ChassiVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, ChassiVeiculo: event.target.value.toUpperCase() }))}
                    className="field-input mt-2 uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Tipo</label>
                  <input
                    value={form.TipoVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, TipoVeiculo: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Ano fabricacao</label>
                  <input
                    type="number"
                    value={form.AnoFab}
                    onChange={(event) => setForm((prev) => ({ ...prev, AnoFab: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Quilometragem</label>
                  <input
                    type="number"
                    value={form.Quilometragem}
                    onChange={(event) => setForm((prev) => ({ ...prev, Quilometragem: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Combustivel</label>
                  <input
                    value={form.Combustivel}
                    onChange={(event) => setForm((prev) => ({ ...prev, Combustivel: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Seguro</label>
                  <input
                    value={form.Seguro}
                    onChange={(event) => setForm((prev) => ({ ...prev, Seguro: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Cor</label>
                  <input
                    required
                    value={form.Cor}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cor: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="field-label">Cliente</label>
                  <select
                    required
                    value={form.ClienteId}
                    onChange={(event) => setForm((prev) => ({ ...prev, ClienteId: event.target.value }))}
                    className="field-select mt-2"
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
                  <label className="field-label">CorId</label>
                  <input
                    type="number"
                    value={form.CorId}
                    onChange={(event) => setForm((prev) => ({ ...prev, CorId: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="field-label">Status</label>
                  <select value={form.Situacao} onChange={(event) => setForm((prev) => ({ ...prev, Situacao: event.target.value }))} className="field-select mt-2">
                    {statusVeiculoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="button-cancel">
                Cancelar
              </button>
              <button type="submit" form="veiculo-form" disabled={submitting || clientes.length === 0} className="button-success disabled:opacity-60">
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

