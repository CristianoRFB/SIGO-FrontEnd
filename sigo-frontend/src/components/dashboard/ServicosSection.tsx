"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Servico } from "@/types/entities";
import {
  createServico,
  deleteServico,
  listServicos,
  updateServico,
} from "@/services/servicos";

interface FormState {
  Nome: string;
  Descricao: string;
  Valor: string;
  Garantia: string;
}

const initialForm: FormState = {
  Nome: "",
  Descricao: "",
  Valor: "0",
  Garantia: new Date().toISOString().slice(0, 10),
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function ServicosSection() {
  const [servicos, setServicos] = useState<Servico[]>([]);
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
      const data = await listServicos();
      setServicos(data);
    } catch {
      setFeedback("Nao foi possivel carregar os servicos.");
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

  function populateForm(servico: Servico) {
    setEditingId(servico.Id);
    setForm({
      Nome: servico.Nome ?? "",
      Descricao: servico.Descricao ?? "",
      Valor: String(servico.Valor ?? 0),
      Garantia: servico.Garantia?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Servico> = {
      Nome: form.Nome,
      Descricao: form.Descricao,
      Valor: Number(form.Valor) || 0,
      Garantia: form.Garantia,
    };

    try {
      if (editingId) {
        await updateServico(editingId, payload);
        setFeedback("Servico atualizado com sucesso.");
      } else {
        await createServico(payload);
        setFeedback("Servico cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch {
      setFeedback("Nao foi possivel salvar o servico.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(servico: Servico) {
    if (!window.confirm(`Remover o servico ${servico.Nome}?`)) {
      return;
    }

    try {
      await deleteServico(servico.Id);
      setFeedback("Servico removido com sucesso.");
      await refresh();
    } catch {
      setFeedback("Nao foi possivel remover o servico.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return servicos;
    }

    const term = search.toLowerCase();
    return servicos.filter((item) =>
      [item.Nome, item.Descricao]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [servicos, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Servicos"
        description="Mantenha o catalogo de servicos e valores atualizados."
        actionSlot={
          <div className="flex items-center gap-3">
            <button type="button" onClick={openModalForCreate} className="button-primary">
              Novo servico
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar servico"
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
            { header: "Servico", key: "Nome" },
            { header: "Descricao", key: "Descricao" },
            {
              header: "Valor",
              key: "Valor",
              align: "right",
              render: (item) => formatCurrency(item.Valor ?? 0),
            },
            {
              header: "Garantia ate",
              key: "Garantia",
              width: "140px",
              render: (item) =>
                item.Garantia ? new Date(item.Garantia).toLocaleDateString("pt-BR") : "-",
            },
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
          emptyMessage={loading ? "Carregando servicos..." : "Nenhum servico cadastrado"}
          getRowId={(item) => item.Id}
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-lg">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">{editingId ? "Editar" : "Novo"} servico</p>
                <h3 className="modal-title">
                  {editingId ? "Atualize os valores" : "Defina os detalhes"}
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
            <form className="modal-body" id="servico-form" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">Nome do servico</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div>
                <label className="field-label">Descricao</label>
                <textarea
                  required
                  rows={3}
                  value={form.Descricao}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, Descricao: event.target.value }))
                  }
                  className="field-textarea mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Valor</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.Valor}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, Valor: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Garantia ate</label>
                  <input
                    required
                    type="date"
                    value={form.Garantia}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, Garantia: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
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
                form="servico-form"
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
