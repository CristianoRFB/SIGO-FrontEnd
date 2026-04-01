"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Cor } from "@/types/entities";
import {
  createCor,
  deleteCor,
  listCores,
  updateCor,
} from "@/services/cores";

const initialForm = {
  NomeCor: "",
};

export function CoresSection() {
  const [cores, setCores] = useState<Cor[]>([]);
  const [form, setForm] = useState(initialForm);
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
      const data = await listCores();
      setCores(data);
    } catch {
      //console.error(error);
      setFeedback("Não foi possível carregar as cores.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(false);
  }

  function openModalForCreate() {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  }

  function populateForm(cor: Cor) {
    setEditingId(cor.Id);
    setForm({ NomeCor: cor.NomeCor ?? "" });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateCor(editingId, form);
        setFeedback("Cor atualizada com sucesso.");
      } else {
        await createCor(form);
        setFeedback("Cor cadastrada com sucesso.");
      }
      await refresh();
      resetForm();
    } catch {
      //console.error(error);
      setFeedback("Não foi possível salvar a cor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cor: Cor) {
    if (!window.confirm(`Remover a cor ${cor.NomeCor}?`)) {
      return;
    }
    try {
      await deleteCor(cor.Id);
      setFeedback("Cor removida com sucesso.");
      await refresh();
    } catch {
      //console.error(error);
      setFeedback("Não foi possível remover a cor.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return cores;
    }
    const term = search.toLowerCase();
    return cores.filter((item) => item.NomeCor?.toLowerCase().includes(term));
  }, [cores, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cores"
        description="Mantenha a base de cores disponível para os cadastros de veículos."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Nova cor
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cor"
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
        <DataTable
          data={filtered}
          columns={[
            { header: "Nome da cor", key: "NomeCor" },
            {
              header: "Ações",
              key: "Id",
              render: (item) => (
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
          emptyMessage={loading ? "Carregando cores..." : "Nenhuma cor cadastrada"}
          getRowId={(item) => item.Id}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-lg flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{editingId ? 'Editar' : 'Nova'} Cor</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{editingId ? 'Atualize o nome' : 'Cadastre novas opções'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <form id="cor-form" className="mt-0 space-y-4 px-6 py-4 overflow-y-auto" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Nome da cor</label>
                <input
                  required
                  value={form.NomeCor}
                  onChange={(event) => setForm({ NomeCor: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
            </form>
            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" form="cor-form" disabled={submitting} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
