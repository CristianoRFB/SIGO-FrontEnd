"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getUserFromToken } from "@/services/auth";
import { getErrorMessage } from "@/services/errors";
import { listMarcas } from "@/services/marcas";
import { createPeca, deletePeca, listPecas, updatePeca } from "@/services/pecas";
import type { Marca, Peca } from "@/types/entities";

interface FormState {
  Nome: string;
  Tipo: string;
  Descricao: string;
  Valor: string;
  Quantidade: string;
  Garantia: string;
  Unidade: string;
  IdMarca: string;
  DataAquisicao: string;
  Fornecedor: string;
  IdOficina: string;
}

const today = new Date().toISOString().slice(0, 10);

const initialForm: FormState = {
  Nome: "",
  Tipo: "",
  Descricao: "",
  Valor: "0",
  Quantidade: "0",
  Garantia: today,
  Unidade: "1",
  IdMarca: "",
  DataAquisicao: today,
  Fornecedor: "",
  IdOficina: "",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value || value.startsWith("0001-01-01")) {
    return "-";
  }

  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("pt-BR");
}

export function PecasSection() {
  const role = getUserFromToken()?.role;
  const canMutate = role === "Admin" || role === "Oficina";
  const [pecas, setPecas] = useState<Peca[]>([]);
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
      setFeedback(null);

      const [pecasList, marcasList] = await Promise.all([listPecas(), listMarcas()]);
      setPecas(pecasList);
      setMarcas(marcasList);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar as pecas."));
    } finally {
      setLoading(false);
    }
  }

  function getDefaultOficinaId() {
    return getUserFromToken()?.oficinaId?.toString() ?? "";
  }

  function resetForm() {
    setForm({
      ...initialForm,
      IdMarca: marcas[0] ? String(marcas[0].Id) : "",
      IdOficina: getDefaultOficinaId(),
    });
    setEditingId(null);
    setShowModal(false);
  }

  function openModalForCreate() {
    if (!canMutate) {
      setFeedback("Seu perfil pode consultar pecas, mas nao criar novos itens.");
      return;
    }

    if (marcas.length === 0) {
      setFeedback("Cadastre pelo menos uma marca antes de cadastrar uma peca.");
      return;
    }

    resetForm();
    setShowModal(true);
  }

  function populateForm(peca: Peca) {
    setEditingId(peca.Id);
    setForm({
      Nome: peca.Nome ?? "",
      Tipo: peca.Tipo ?? "",
      Descricao: peca.Descricao ?? "",
      Valor: String(peca.Valor ?? 0),
      Quantidade: String(peca.Quantidade ?? 0),
      Garantia: peca.Garantia?.slice(0, 10) || today,
      Unidade: String(peca.Unidade ?? 1),
      IdMarca: String(peca.IdMarca ?? ""),
      DataAquisicao: peca.DataAquisicao?.slice(0, 10) || today,
      Fornecedor: peca.Fornecedor ?? "",
      IdOficina: String(peca.IdOficina ?? getDefaultOficinaId()),
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.IdMarca) {
      setFeedback("Selecione uma marca para vincular a peca.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Peca> = {
      Nome: form.Nome,
      Tipo: form.Tipo,
      Descricao: form.Descricao,
      Valor: Number(form.Valor) || 0,
      Quantidade: Number(form.Quantidade) || 0,
      Garantia: form.Garantia,
      Unidade: Number(form.Unidade) || 1,
      IdMarca: Number(form.IdMarca),
      DataAquisicao: form.DataAquisicao,
      Fornecedor: form.Fornecedor,
      IdOficina: Number(form.IdOficina) || undefined,
    };

    try {
      if (editingId) {
        await updatePeca(editingId, payload);
        setFeedback("Peca atualizada com sucesso.");
      } else {
        await createPeca(payload);
        setFeedback("Peca cadastrada com sucesso.");
      }

      await refresh();
      resetForm();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel salvar a peca."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(peca: Peca) {
    if (!window.confirm(`Remover a peca ${peca.Nome}?`)) {
      return;
    }

    try {
      await deletePeca(peca.Id);
      setFeedback("Peca removida com sucesso.");
      await refresh();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel remover a peca."));
    }
  }

  const marcasById = useMemo(
    () => new Map(marcas.map((marca) => [marca.Id, marca.Nome])),
    [marcas]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return pecas;
    }

    const term = search.toLowerCase();
    return pecas.filter((peca) =>
      [peca.Nome, peca.Tipo, peca.Fornecedor, marcasById.get(peca.IdMarca)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [marcasById, pecas, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pecas"
        description="Controle o estoque de pecas exposto pelo backend, com marca, fornecedor e garantia."
        actionSlot={
          <div className="flex items-center gap-3">
            {canMutate && (
              <button type="button" onClick={openModalForCreate} className="button-primary">
                Nova peca
              </button>
            )}
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, tipo, marca ou fornecedor"
              className="toolbar-search w-80"
            />
          </div>
        }
      />

      {marcas.length === 0 && !loading && (
        <div className="feedback-warning">
          Nenhuma marca cadastrada. Cadastre uma marca antes de criar uma peca.
        </div>
      )}

      {feedback && <div className="feedback-info">{feedback}</div>}

      <DataTable
        data={filtered}
        columns={[
          { header: "Peca", key: "Nome" },
          { header: "Tipo", key: "Tipo" },
          {
            header: "Marca",
            key: "IdMarca",
            render: (peca: Peca) => marcasById.get(peca.IdMarca) ?? `#${peca.IdMarca}`,
          },
          {
            header: "Qtd.",
            key: "Quantidade",
            align: "right",
            width: "90px",
          },
          {
            header: "Valor",
            key: "Valor",
            align: "right",
            render: (peca: Peca) => formatCurrency(peca.Valor),
          },
          {
            header: "Garantia",
            key: "Garantia",
            width: "120px",
            render: (peca: Peca) => formatDate(peca.Garantia),
          },
          {
            header: "Acoes",
            key: "Id",
            render: (peca: Peca) =>
              canMutate ? (
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => populateForm(peca)} className="button-inline">
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(peca)}
                    className="button-inline-danger"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <span className="text-sm text-slate-400">Consulta</span>
              ),
          },
        ]}
        emptyMessage={loading ? "Carregando pecas..." : "Nenhuma peca cadastrada"}
        getRowId={(peca) => peca.Id}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-2xl">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">{editingId ? "Editar" : "Nova"} peca</p>
                <h3 className="modal-title">
                  {editingId ? "Atualize o estoque" : "Cadastre o item no catalogo"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="button-ghost">
                Fechar
              </button>
            </div>

            <form id="peca-form" className="modal-body" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="field-label">Nome da peca</label>
                  <input
                    required
                    value={form.Nome}
                    onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Tipo</label>
                  <input
                    required
                    value={form.Tipo}
                    onChange={(event) => setForm((prev) => ({ ...prev, Tipo: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
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

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="field-label">Marca</label>
                  <select
                    required
                    value={form.IdMarca}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, IdMarca: event.target.value }))
                    }
                    className="field-select mt-2"
                  >
                    <option value="">Selecione</option>
                    {marcas.map((marca) => (
                      <option key={marca.Id} value={marca.Id}>
                        {marca.Nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Quantidade</label>
                  <input
                    required
                    type="number"
                    value={form.Quantidade}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, Quantidade: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Unidade</label>
                  <input
                    required
                    type="number"
                    value={form.Unidade}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, Unidade: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="field-label">Valor</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.Valor}
                    onChange={(event) => setForm((prev) => ({ ...prev, Valor: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Aquisicao</label>
                  <input
                    required
                    type="date"
                    value={form.DataAquisicao}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DataAquisicao: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Garantia</label>
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

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="field-label">Fornecedor</label>
                  <input
                    required
                    value={form.Fornecedor}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, Fornecedor: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Oficina ID</label>
                  <input
                    type="number"
                    value={form.IdOficina}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, IdOficina: event.target.value }))
                    }
                    placeholder="Preenchido pelo login da oficina"
                    className="field-input mt-2"
                  />
                </div>
              </div>
            </form>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="button-cancel">
                Cancelar
              </button>
              <button
                type="submit"
                form="peca-form"
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
