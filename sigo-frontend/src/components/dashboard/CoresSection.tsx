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
      setFeedback("Nao foi possivel carregar as cores.");
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
      setFeedback("Nao foi possivel salvar a cor.");
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
      setFeedback("Nao foi possivel remover a cor.");
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
        description="Mantenha a base de cores disponivel para os cadastros de veiculos."
        actionSlot={
          <div className="flex items-center gap-3">
            <button type="button" onClick={openModalForCreate} className="button-primary">
              Nova cor
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cor"
              className="toolbar-search w-64"
            />
          </div>
        }
      />

      {feedback && <div className="feedback-success">{feedback}</div>}

      <div className="grid gap-6">
        <DataTable
          data={filtered}
          columns={[
            { header: "Nome da cor", key: "NomeCor" },
            {
              header: "Acoes",
              key: "Id",
              render: (item) => (
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
          emptyMessage={loading ? "Carregando cores..." : "Nenhuma cor cadastrada"}
          getRowId={(item) => item.Id}
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-md">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">{editingId ? "Editar" : "Nova"} cor</p>
                <h3 className="modal-title">
                  {editingId ? "Atualize o nome" : "Cadastre novas opcoes"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="button-ghost"
              >
                Fechar
              </button>
            </div>
            <form id="cor-form" className="modal-body" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="field-label">Nome da cor</label>
                <input
                  required
                  value={form.NomeCor}
                  onChange={(event) => setForm({ NomeCor: event.target.value })}
                  className="field-input mt-2"
                />
              </div>
            </form>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="button-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="cor-form"
                disabled={submitting}
                className="button-success disabled:opacity-60"
              >
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
