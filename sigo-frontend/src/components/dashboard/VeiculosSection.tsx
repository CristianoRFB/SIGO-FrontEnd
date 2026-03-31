"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { statusVeiculoOptions } from "@/lib/constants";
import { Cor, Veiculo } from "@/types/entities";
import {
  createVeiculo,
  deleteVeiculo,
  listVeiculos,
  updateVeiculo,
} from "@/services/veiculos";
import { listCores } from "@/services/cores";

interface FormState {
  NomeVeiculo: string;
  TipoVeiculo: string;
  PlacaVeiculo: string;
  ChassiVeiculo: string;
  AnoFab: string;
  Quilometragem: string;
  Combustivel: string;
  Seguro: string;
  Status: string;
  Cores: number[];
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
  Status: "0",
  Cores: [],
};

function resolveStatus(value: number) {
  return statusVeiculoOptions.find((option) => option.value === value)?.label ?? "-";
}

export function VeiculosSection() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [cores, setCores] = useState<Cor[]>([]);
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
      const [veiculosList, coresList] = await Promise.all([
        listVeiculos(),
        listCores(),
      ]);
      setVeiculos(veiculosList);
      setCores(coresList);
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível carregar os veículos.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
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
      Status: String(veiculo.Status ?? 0),
      Cores: veiculo.Cores?.map((cor) => cor.Id) ?? [],
    });
    setShowModal(true);
  }

  function openModalForCreate() {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      Status: Number(form.Status),
      Cores: form.Cores.map((id) => ({ Id: id, NomeCor: cores.find((cor) => cor.Id === id)?.NomeCor ?? "" })),
    };

    try {
      if (editingId) {
        await updateVeiculo(editingId, payload);
        setFeedback("Veículo atualizado com sucesso.");
      } else {
        await createVeiculo(payload);
        setFeedback("Veículo cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível salvar o veículo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(veiculo: Veiculo) {
    if (!window.confirm(`Remover o veículo ${veiculo.NomeVeiculo}?`)) {
      return;
    }
    try {
      await deleteVeiculo(veiculo.Id);
      setFeedback("Veículo removido com sucesso.");
      await refresh();
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível remover o veículo.");
    }
  }

  function toggleCor(id: number) {
    setForm((prev) => ({
      ...prev,
      Cores: prev.Cores.includes(id)
        ? prev.Cores.filter((value) => value !== id)
        : [...prev.Cores, id],
    }));
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return veiculos;
    }
    const term = search.toLowerCase();
    return veiculos.filter((item) =>
      [item.NomeVeiculo, item.TipoVeiculo, item.PlacaVeiculo]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [veiculos, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Veículos"
        description="Gerencie os veículos cadastrados e acompanhe o status do atendimento."
        actionSlot={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openModalForCreate}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Novo veículo
              </button>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por placa ou modelo"
                className="w-64 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
        }
      />

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <DataTable
            data={filtered}
            columns={[
              { header: "Veículo", key: "NomeVeiculo" },
              { header: "Placa", key: "PlacaVeiculo", width: "120px" },
              {
                header: "Status",
                key: "Status",
                render: (item: Veiculo) => <span className="text-sm">{resolveStatus(item.Status)}</span>,
              },
              {
                header: "Ações",
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
            emptyMessage={loading ? "Carregando veículos..." : "Nenhum veículo encontrado"}
            getRowId={(v) => v.Id}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{editingId ? 'Editar' : 'Novo'} Veículo</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{editingId ? 'Atualize o status' : 'Preencha os dados'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <form id="veiculo-form" className="mt-0 space-y-4 px-6 py-4 overflow-y-auto" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Nome / Modelo</label>
                <input
                  required
                  value={form.NomeVeiculo}
                  onChange={(event) => setForm((prev) => ({ ...prev, NomeVeiculo: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Placa</label>
                  <input
                    required
                    value={form.PlacaVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, PlacaVeiculo: event.target.value.toUpperCase() }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Chassi</label>
                  <input
                    value={form.ChassiVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, ChassiVeiculo: event.target.value.toUpperCase() }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Tipo</label>
                  <input
                    value={form.TipoVeiculo}
                    onChange={(event) => setForm((prev) => ({ ...prev, TipoVeiculo: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Ano fabricação</label>
                  <input
                    type="number"
                    min="1950"
                    value={form.AnoFab}
                    onChange={(event) => setForm((prev) => ({ ...prev, AnoFab: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quilometragem</label>
                  <input
                    type="number"
                    value={form.Quilometragem}
                    onChange={(event) => setForm((prev) => ({ ...prev, Quilometragem: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Combustível</label>
                  <input
                    value={form.Combustivel}
                    onChange={(event) => setForm((prev) => ({ ...prev, Combustivel: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Seguro</label>
                <input
                  value={form.Seguro}
                  onChange={(event) => setForm((prev) => ({ ...prev, Seguro: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Status da OS</label>
                <select
                  value={form.Status}
                  onChange={(event) => setForm((prev) => ({ ...prev, Status: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                >
                  {statusVeiculoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Cores</p>
                <div className="grid grid-cols-2 gap-2">
                  {cores.map((cor) => {
                    const checked = form.Cores.includes(cor.Id);
                    return (
                      <label key={cor.Id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${checked ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-white text-slate-600"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCor(cor.Id)} className="h-4 w-4 rounded border-slate-300 text-emerald-500" />
                        {cor.NomeCor}
                      </label>
                    );
                  })}
                  {cores.length === 0 && (
                    <p className="col-span-2 text-xs text-slate-400">Cadastre cores na seção "Cores" para associá-las aos veículos.</p>
                  )}
                </div>
              </div>
            </form>
            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" form="veiculo-form" disabled={submitting} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
