"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Marca } from "@/types/entities";
import {
  createMarca,
  deleteMarca,
  listMarcas,
  updateMarca,
} from "@/services/marcas";

interface FormState {
  Nome: string;
  Desc: string;
  TipoMarca: string;
}

const initialForm: FormState = {
  Nome: "",
  Desc: "",
  TipoMarca: "",
};

export function MarcasSection() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
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
      const data = await listMarcas();
      setMarcas(data);
    } catch {
      setFeedback("Nao foi possivel carregar as marcas.");
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
    resetForm();
    setShowModal(true);
  }

  function populateForm(marca: Marca) {
    setEditingId(marca.Id);
    setForm({
      Nome: marca.Nome ?? "",
      Desc: marca.Desc ?? "",
      TipoMarca: marca.TipoMarca ?? "",
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingId !== null) {
        await updateMarca(editingId, { ...form, Id: editingId });
        setFeedback("Marca atualizada com sucesso.");
      } else {
        await createMarca(form);
        setFeedback("Marca cadastrada com sucesso.");
      }
      await refresh();
      resetForm();
    } catch {
      setFeedback("Nao foi possivel salvar a marca.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(marca: Marca) {
    if (!window.confirm(`Remover a marca ${marca.Nome}?`)) {
      return;
    }

    try {
      await deleteMarca(marca.Id);
      setFeedback("Marca removida com sucesso.");
      await refresh();
    } catch {
      setFeedback("Nao foi possivel remover a marca.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return marcas;
    }

    const term = search.toLowerCase();

    return marcas.filter((marca) =>
      [marca.Nome, marca.TipoMarca]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [marcas, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marcas"
        description="Gerencie o catalogo de marcas relacionadas aos veiculos e produtos."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Nova marca
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou tipo"
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

      <DataTable
        data={filtered}
        columns={[
          { header: "Marca", key: "Nome" },
          { header: "Descricao", key: "Desc" },
          { header: "Segmento", key: "TipoMarca" },
          {
            header: "Acoes",
            key: "Id",
            render: (marca: Marca) => (
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => populateForm(marca)}
                  className="rounded-lg border border-emerald-200 px-3 py-1 font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(marca)}
                  className="rounded-lg border border-rose-200 px-3 py-1 font-medium text-rose-600 hover:bg-rose-50"
                >
                  Remover
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage={loading ? "Carregando marcas..." : "Nenhuma marca cadastrada"}
        getRowId={(marca) => marca.Id}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {editingId !== null ? "Editar" : "Nova"} Marca
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId !== null ? "Atualize as informacoes" : "Preencha os dados"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                Fechar
              </button>
            </div>
            <form id="marca-form" className="mt-0 space-y-4 overflow-y-auto px-6 py-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome da marca</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Segmento ou linha</label>
                <input
                  value={form.TipoMarca}
                  onChange={(event) => setForm((prev) => ({ ...prev, TipoMarca: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Descricao</label>
                <textarea
                  rows={3}
                  value={form.Desc}
                  onChange={(event) => setForm((prev) => ({ ...prev, Desc: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
            </form>
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" form="marca-form" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {submitting ? "Salvando..." : editingId !== null ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
