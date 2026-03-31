"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Marca } from "@/types/entities";
import {
  createMarca,
  deleteMarca,
  listMarcas,
  updateMarca,
} from "@/services/marcas";

interface FormState {
  NomeMarca: string;
  DescMarca: string;
  TipoMarca: string;
}

const initialForm: FormState = {
  NomeMarca: "",
  DescMarca: "",
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
    console.log("Dados recebidos:", data);
    setMarcas(data);
  } catch {
    setFeedback("Não foi possível carregar as marcas.");
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
    setEditingId(marca.IdMarca ?? null);
    setForm({
      NomeMarca: marca.NomeMarca ?? "",
      DescMarca: marca.DescMarca ?? "",
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
        await updateMarca(editingId, form);
        setFeedback("Marca atualizada com sucesso.");
      } else {
        await createMarca(form);
        setFeedback("Marca cadastrada com sucesso.");
      }
      await refresh();
      resetForm();
    } catch {
      setFeedback("Não foi possível salvar a marca.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(marca: Marca) {
    if (!window.confirm(`Remover a marca ${marca.NomeMarca}?`)) return;

    try {
      await deleteMarca(marca.IdMarca);
      setFeedback("Marca removida com sucesso.");
      await refresh();
    } catch {
      setFeedback("Não foi possível remover a marca.");
    }
  }

  // Filtro simples, sem chance de remover tudo sem querer:
  const filtered = useMemo(() => {
    if (!search.trim()) return marcas;
    const term = search.toLowerCase();
    return marcas.filter((m) =>
      [m.NomeMarca, m.TipoMarca].some((val) =>
        val?.toLowerCase().includes(term)
      )
    );
  }, [marcas, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marcas"
        description="Gerencie o catálogo de marcas relacionadas aos veículos e produtos."
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
              onChange={(e) => setSearch(e.target.value)}
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-200">
          <thead className="bg-slate-100 text-slate-700 text-left text-xs font-semibold uppercase tracking-wide">
            <tr>
              <th className="border border-slate-300 px-4 py-2">Marca</th>
              <th className="border border-slate-300 px-4 py-2">Descrição</th>
              <th className="border border-slate-300 px-4 py-2">Segmento</th>
              <th className="border border-slate-300 px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-500">
                  Carregando marcas...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-500">
                  Nenhuma marca cadastrada
                </td>
              </tr>
            ) : (
              filtered.map((marca) => (
                <tr key={marca.IdMarca}>
                  <td className="border border-slate-300 px-4 py-2">
                    {marca.NomeMarca || "—"}
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    {marca.DescMarca || "—"}
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    {marca.TipoMarca || "—"}
                  </td>
                  <td className="border border-slate-300 px-4 py-2">
                    <button
                      onClick={() => populateForm(marca)}
                      className="text-blue-600 hover:underline text-xs font-medium mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(marca)}
                      className="text-red-600 hover:underline text-xs font-medium"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  {editingId !== null ? "Editar" : "Nova"} Marca
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId !== null
                    ? "Atualize as informações"
                    : "Preencha os dados"}
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
              id="marca-form"
              className="mt-0 space-y-4 px-6 py-4 overflow-y-auto"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400">
                  Nome da marca
                </label>
                <input
                  required
                  value={form.NomeMarca}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, NomeMarca: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">
                  Segmento ou linha
                </label>
                <input
                  value={form.TipoMarca}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, TipoMarca: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={form.DescMarca}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, DescMarca: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
            </form>

            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="marca-form"
                disabled={submitting}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting
                  ? "Salvando..."
                  : editingId !== null
                  ? "Atualizar"
                  : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}