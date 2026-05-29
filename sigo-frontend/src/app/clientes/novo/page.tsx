"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCliente } from "@/services/clientes";

export default function NovoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    Nome: "",
    Email: "",
    senha: "",
    Cpf_Cnpj: "",
    DataNasc: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await createCliente({
        Nome: form.Nome,
        Email: form.Email,
        senha: form.senha,
        Cpf_Cnpj: form.Cpf_Cnpj,
        DataNasc: form.DataNasc,
      });
      setFeedback("Cliente cadastrado com sucesso.");
      setTimeout(() => router.push("/clientes"), 800);
    } catch {
      setFeedback("Erro ao cadastrar o cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="app-panel mb-6 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
              Painel / Clientes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              Cadastrar cliente
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use este cadastro rapido para incluir um cliente diretamente no ambiente administrativo.
            </p>
          </div>
          <Link href="/clientes" className="button-secondary">
            Voltar para clientes
          </Link>
        </div>

        {feedback && <div className="feedback-info mb-4">{feedback}</div>}

        <form onSubmit={handleSubmit} className="app-card space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">Nome completo</label>
              <input
                required
                value={form.Nome}
                onChange={(e) => setForm((current) => ({ ...current, Nome: e.target.value }))}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label className="field-label">E-mail</label>
              <input
                required
                type="email"
                value={form.Email}
                onChange={(e) => setForm((current) => ({ ...current, Email: e.target.value }))}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label className="field-label">Senha de acesso</label>
              <input
                required
                type="password"
                value={form.senha}
                onChange={(e) => setForm((current) => ({ ...current, senha: e.target.value }))}
                className="field-input mt-2"
              />
            </div>

            <div>
              <label className="field-label">CPF / CNPJ</label>
              <input
                required
                value={form.Cpf_Cnpj}
                onChange={(e) =>
                  setForm((current) => ({ ...current, Cpf_Cnpj: e.target.value }))
                }
                className="field-input mt-2"
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="field-label">Data de nascimento</label>
            <input
              type="date"
              value={form.DataNasc}
              onChange={(e) =>
                setForm((current) => ({ ...current, DataNasc: e.target.value }))
              }
              className="field-input mt-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
            <button type="submit" disabled={loading} className="button-success disabled:opacity-60">
              {loading ? "Cadastrando..." : "Cadastrar cliente"}
            </button>
            <Link href="/clientes" className="button-cancel">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
