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
              className="button-primary"
            >
              Nova marca
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou tipo"
              className="toolbar-search w-64"
            />
          </div>
        }
      />

      {feedback && (
        <div className="feedback-success">
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
                  className="button-inline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(marca)}
                  className="button-inline-danger"
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
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {editingId !== null ? "Editar" : "Nova"} Marca
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId !== null ? "Atualize as informacoes" : "Preencha os dados"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="button-ghost">
                Fechar
              </button>
            </div>
            <form id="marca-form" className="modal-body" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">Nome da marca</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div>
                <label className="field-label">Segmento ou linha</label>
                <input
                  value={form.TipoMarca}
                  onChange={(event) => setForm((prev) => ({ ...prev, TipoMarca: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div>
                <label className="field-label">Descricao</label>
                <textarea
                  rows={3}
                  value={form.Desc}
                  onChange={(event) => setForm((prev) => ({ ...prev, Desc: event.target.value }))}
                  className="field-textarea mt-2"
                />
              </div>
            </form>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="button-cancel">
                Cancelar
              </button>
              <button type="submit" form="marca-form" disabled={submitting} className="button-success disabled:opacity-60">
                {submitting ? "Salvando..." : editingId !== null ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

