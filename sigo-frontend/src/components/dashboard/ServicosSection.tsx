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
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível carregar os serviços.");
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
        setFeedback("Serviço atualizado com sucesso.");
      } else {
        await createServico(payload);
        setFeedback("Serviço cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível salvar o serviço.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(servico: Servico) {
    if (!window.confirm(`Remover o serviço ${servico.Nome}?`)) {
      return;
    }
    try {
      await deleteServico(servico.Id);
      setFeedback("Serviço removido com sucesso.");
      await refresh();
    } catch (error) {
      //console.error(error);
      setFeedback("Não foi possível remover o serviço.");
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
        title="Serviços"
        description="Mantenha o catálogo de serviços e valores atualizados."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Novo serviço
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar serviço"
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
            { header: "Serviço", key: "Nome" },
            { header: "Descrição", key: "Descricao" },
            {
              header: "Valor",
              key: "Valor",
              align: "right",
              render: (item) => formatCurrency(item.Valor ?? 0),
            },
            {
              header: "Garantia até",
              key: "Garantia",
              width: "140px",
              render: (item) => (item.Garantia ? new Date(item.Garantia).toLocaleDateString("pt-BR") : "-"),
            },
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
          emptyMessage={
            loading ? "Carregando serviços..." : "Nenhum serviço cadastrado"
          }
          getRowId={(item) => item.Id}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{editingId ? 'Editar' : 'Novo'} Serviço</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{editingId ? 'Atualize os valores' : 'Defina os detalhes'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <form className="mt-0 space-y-4 px-6 py-4 overflow-y-auto" id="servico-form" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome do serviço</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Descrição</label>
                <textarea
                  required
                  rows={3}
                  value={form.Descricao}
                  onChange={(event) => setForm((prev) => ({ ...prev, Descricao: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Valor</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.Valor}
                    onChange={(event) => setForm((prev) => ({ ...prev, Valor: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Garantia até</label>
                  <input
                    type="date"
                    value={form.Garantia}
                    onChange={(event) => setForm((prev) => ({ ...prev, Garantia: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </form>
            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" form="servico-form" disabled={submitting} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
