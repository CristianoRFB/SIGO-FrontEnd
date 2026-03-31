"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      setFeedback("Aluno cadastrado com sucesso.");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (error) {
      //console.error(error);
      setFeedback("Erro ao cadastrar o aluno.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Novo Aluno</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Cadastrar aluno</h1>
            <p className="mt-1 text-sm text-slate-500">Preencha as informações abaixo para cadastrar um novo aluno.</p>
          </div>
          <div>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">Voltar ao painel</Link>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{feedback}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-6 shadow">
          <div>
            <label className="block text-xs font-semibold text-slate-400">Nome completo</label>
            <input
              required
              value={form.Nome}
              onChange={(e) => setForm((p) => ({ ...p, Nome: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400">E-mail</label>
            <input
              required
              type="email"
              value={form.Email}
              onChange={(e) => setForm((p) => ({ ...p, Email: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400">Senha de acesso</label>
            <input
              required
              type="password"
              value={form.senha}
              onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400">CPF / CNPJ</label>
            <input
              required
              value={form.Cpf_Cnpj}
              onChange={(e) => setForm((p) => ({ ...p, Cpf_Cnpj: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400">Data de nascimento</label>
            <input
              type="date"
              value={form.DataNasc}
              onChange={(e) => setForm((p) => ({ ...p, DataNasc: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Cadastrando..." : "Cadastrar aluno"}
            </button>
            <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
