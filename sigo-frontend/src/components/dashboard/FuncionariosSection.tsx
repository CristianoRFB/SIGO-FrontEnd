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
              className="button-primary"
            >
              Novo colaborador
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou cargo"
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
        emptyMessage={loading ? "Carregando funcionarios..." : "Nenhum funcionario cadastrado"}
        getRowId={(item) => item.Id}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-lg">
            <div className="modal-header">
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
                className="button-ghost"
              >
                Fechar
              </button>
            </div>
            <form
              id="funcionario-form"
              className="modal-body"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="field-label">Nome completo</label>
                <input
                  required
                  value={form.Nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">CPF</label>
                  <input
                    required
                    value={form.Cpf}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cpf: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Cargo</label>
                  <input
                    required
                    value={form.Cargo}
                    onChange={(event) => setForm((prev) => ({ ...prev, Cargo: event.target.value }))}
                    className="field-input mt-2"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">E-mail</label>
                <input
                  required
                  type="email"
                  value={form.Email}
                  onChange={(event) => setForm((prev) => ({ ...prev, Email: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div>
                <label className="field-label">Senha</label>
                <input
                  required
                  type="password"
                  value={form.Senha}
                  onChange={(event) => setForm((prev) => ({ ...prev, Senha: event.target.value }))}
                  className="field-input mt-2"
                />
              </div>
              <div>
                <label className="field-label">Situacao</label>
                <select
                  value={form.Situacao}
                  onChange={(event) => setForm((prev) => ({ ...prev, Situacao: event.target.value }))}
                  className="field-select mt-2"
                >
                  {situacaoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="button-cancel">
                Cancelar
              </button>
              <button type="submit" form="funcionario-form" disabled={submitting} className="button-success disabled:opacity-60">
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

