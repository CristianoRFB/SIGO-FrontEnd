"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { situacaoOptions } from "@/lib/constants";
import { Funcionario } from "@/types/entities";
import {
  createFuncionario,
  deleteFuncionario,
  listFuncionarios,
  updateFuncionario,
} from "@/services/funcionarios";

interface FormState {
  Nome: string;
  Cpf: string;
  Cargo: string;
  Email: string;
  Senha: string;
  Situacao: string;
}

const initialForm: FormState = {
  Nome: "",
  Cpf: "",
  Cargo: "",
  Email: "",
  Senha: "",
  Situacao: "1",
};

export function FuncionariosSection() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
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
      const data = await listFuncionarios();
      setFuncionarios(data);
    } catch {
      setFeedback("Nao foi possivel carregar os colaboradores.");
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

  function populateForm(funcionario: Funcionario) {
    setEditingId(funcionario.Id);
    setForm({
      Nome: funcionario.Nome ?? "",
      Cpf: funcionario.Cpf ?? "",
      Cargo: funcionario.Cargo ?? "",
      Email: funcionario.Email ?? "",
      Senha: funcionario.Senha ?? "",
      Situacao: String(funcionario.Situacao ?? 1),
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Funcionario> = {
      Nome: form.Nome,
      Cpf: form.Cpf,
      Cargo: form.Cargo,
      Email: form.Email,
      Senha: form.Senha,
      Situacao: Number(form.Situacao),
    };

    try {
      if (editingId) {
        await updateFuncionario(editingId, payload);
        setFeedback("Colaborador atualizado com sucesso.");
      } else {
        await createFuncionario(payload);
        setFeedback("Colaborador cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch {
      setFeedback("Nao foi possivel salvar o colaborador.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(funcionario: Funcionario) {
    if (!window.confirm(`Remover ${funcionario.Nome}?`)) {
      return;
    }

    try {
      await deleteFuncionario(funcionario.Id);
      setFeedback("Colaborador removido.");
      await refresh();
    } catch {
      setFeedback("Nao foi possivel remover o colaborador.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return funcionarios;
    }

    const term = search.toLowerCase();

    return funcionarios.filter((item) =>
      [item.Nome, item.Email, item.Cargo]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [funcionarios, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Funcionarios"
        description="Gerencie dados dos funcionarios, cargos e situacao."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Novo colaborador
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou cargo"
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
          { header: "Nome", key: "Nome" },
          { header: "Cargo", key: "Cargo" },
          { header: "E-mail", key: "Email" },
          { header: "CPF", key: "Cpf", width: "140px" },
          {
            header: "Situacao",
            key: "Situacao",
            render: (item) => (
              <span
                className={`badge ${
                  item.Situacao === 1 ? "badge-success" : "badge-warning"
                }`}
              >
                {situacaoOptions.find((option) => option.value === item.Situacao)?.label}
              </span>
            ),
          },
          {
            header: "Acoes",
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
        emptyMessage={loading ? "Carregando funcionarios..." : "Nenhum funcionario cadastrado"}
        getRowId={(item) => item.Id}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {editingId ? "Editar" : "Novo"} Colaborador
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {editingId ? "Atualize as informacoes" : "Preencha os dados"}
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
              id="funcionario-form"
              className="mt-0 space-y-4 overflow-y-auto px-6 py-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome completo</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">CPF</label>
                  <input
                    required
                    value={form.Cpf}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cpf: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Cargo</label>
                  <input
                    required
                    value={form.Cargo}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cargo: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">E-mail</label>
                <input
                  required
                  type="email"
                  value={form.Email}
                  onChange={(event) => setForm((prev) => ({ ...prev, Email: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Senha</label>
                <input
                  required
                  type="password"
                  value={form.Senha}
                  onChange={(event) => setForm((prev) => ({ ...prev, Senha: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Situacao</label>
                <select
                  value={form.Situacao}
                  onChange={(event) => setForm((prev) => ({ ...prev, Situacao: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                >
                  {situacaoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" form="funcionario-form" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
