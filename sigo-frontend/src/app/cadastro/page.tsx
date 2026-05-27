"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { sexoOptions, tipoClienteOptions } from "@/lib/constants";
import { ApiError } from "@/services/api-client";
import { extractApiMessage } from "@/services/errors";
import { createCliente } from "@/services/clientes";
import { Cliente } from "@/types/entities";

interface CadastroFormState {
  Nome: string;
  Email: string;
  senha: string;
  Cpf_Cnpj: string;
  DataNasc: string;
  Sexo: number;
  TipoCliente: number;
  Numero: string;
  Rua: string;
  Cidade: string;
  Cep: string;
  Bairro: string;
  Estado: string;
  Pais: string;
  Complemento: string;
  razao: string;
}

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function createInitialFormState(): CadastroFormState {
  return {
    Nome: "",
    Email: "",
    senha: "",
    Cpf_Cnpj: "",
    DataNasc: getTodayInputValue(),
    Sexo: 3,
    TipoCliente: 1,
    Numero: "",
    Rua: "",
    Cidade: "",
    Cep: "",
    Bairro: "",
    Estado: "",
    Pais: "Brasil",
    Complemento: "",
    razao: "",
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const apiMessage = extractApiMessage(error.response);

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return "Erro de rede ao conectar com a API. Verifique se o backend do SIGO está em execução.";
    }

    return `Não foi possível concluir o cadastro (${error.message})`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível concluir o cadastro.";
}

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState<CadastroFormState>(createInitialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const documentoLabel = useMemo(
    () => (form.TipoCliente === 2 ? "CNPJ" : "CPF"),
    [form.TipoCliente]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: Partial<Cliente> = {
      Nome: form.Nome.trim(),
      Email: form.Email.trim(),
      senha: form.senha,
      Cpf_Cnpj: form.Cpf_Cnpj.trim(),
      DataNasc: form.DataNasc,
      Sexo: form.Sexo,
      TipoCliente: form.TipoCliente,
      Situacao: 1,
      Numero: Number(form.Numero) || 0,
      Rua: form.Rua.trim(),
      Cidade: form.Cidade.trim(),
      Cep: form.Cep.trim(),
      Bairro: form.Bairro.trim(),
      Estado: form.Estado.trim(),
      Pais: form.Pais.trim(),
      Complemento: form.Complemento.trim(),
      razao: form.razao.trim(),
      Obs: "",
    };

    try {
      setLoading(true);
      await createCliente(payload);
      setSuccess("Cadastro realizado com sucesso. Redirecionando para o login...");
      setForm(createInitialFormState());
      setTimeout(() => router.push("/login"), 1200);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Primeiro acesso"
      title="Crie seu cadastro para acompanhar sua oficina com mais clareza."
      description="Use os dados mínimos do cliente para iniciar no SIGO sem sair do padrão visual já adotado na plataforma."
      footer={
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Já possui acesso?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Entrar agora
            </Link>
          </p>
          <p className="mt-3">© {new Date().getFullYear()} SIGO. Todos os direitos reservados.</p>
        </div>
      }
    >
      <form
        className="mt-12 space-y-7 rounded-[20px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] sm:p-6 lg:p-7"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="nome">
            <span>Nome completo</span>
            <input
              id="nome"
              type="text"
              required
              value={form.Nome}
              onChange={(event) => setForm((current) => ({ ...current, Nome: event.target.value }))}
              placeholder="Digite seu nome"
              className="field-input"
              autoComplete="name"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="tipo-cliente">
            <span>Tipo de cliente</span>
            <select
              id="tipo-cliente"
              value={form.TipoCliente}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  TipoCliente: Number(event.target.value),
                }))
              }
              className="field-select"
            >
              {tipoClienteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="sexo">
            <span>Sexo</span>
            <select
              id="sexo"
              value={form.Sexo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Sexo: Number(event.target.value),
                }))
              }
              className="field-select"
            >
              {sexoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="documento">
            <span>{documentoLabel}</span>
            <input
              id="documento"
              type="text"
              required
              value={form.Cpf_Cnpj}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Cpf_Cnpj: event.target.value,
                }))
              }
              placeholder={`Digite seu ${documentoLabel}`}
              className="field-input"
              autoComplete="off"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="data-nascimento">
            <span>Data de nascimento</span>
            <input
              id="data-nascimento"
              type="date"
              required
              value={form.DataNasc}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  DataNasc: event.target.value,
                }))
              }
              className="field-select"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="razao">
            <span>Razão social / apelido</span>
            <input
              id="razao"
              type="text"
              value={form.razao}
              onChange={(event) => setForm((current) => ({ ...current, razao: event.target.value }))}
              placeholder="Opcional"
              className="field-input"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="email">
            <span>E-mail</span>
            <input
              id="email"
              type="email"
              required
              value={form.Email}
              onChange={(event) => setForm((current) => ({ ...current, Email: event.target.value }))}
              placeholder="seuemail@empresa.com"
              className="field-input"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="senha">
            <span>Senha</span>
            <input
              id="senha"
              type="password"
              required
              value={form.senha}
              onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
              placeholder="Crie sua senha"
              className="field-input"
              autoComplete="new-password"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="cep">
            <span>CEP</span>
            <input
              id="cep"
              type="text"
              required
              value={form.Cep}
              onChange={(event) => setForm((current) => ({ ...current, Cep: event.target.value }))}
              placeholder="00000-000"
              className="field-input"
              autoComplete="postal-code"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="estado">
            <span>Estado</span>
            <input
              id="estado"
              type="text"
              required
              value={form.Estado}
              onChange={(event) => setForm((current) => ({ ...current, Estado: event.target.value }))}
              placeholder="UF"
              className="field-input"
              autoComplete="address-level1"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="cidade">
            <span>Cidade</span>
            <input
              id="cidade"
              type="text"
              required
              value={form.Cidade}
              onChange={(event) => setForm((current) => ({ ...current, Cidade: event.target.value }))}
              placeholder="Sua cidade"
              className="field-input"
              autoComplete="address-level2"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="bairro">
            <span>Bairro</span>
            <input
              id="bairro"
              type="text"
              required
              value={form.Bairro}
              onChange={(event) => setForm((current) => ({ ...current, Bairro: event.target.value }))}
              placeholder="Seu bairro"
              className="field-input"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="rua">
            <span>Rua</span>
            <input
              id="rua"
              type="text"
              required
              value={form.Rua}
              onChange={(event) => setForm((current) => ({ ...current, Rua: event.target.value }))}
              placeholder="Informe a rua"
              className="field-input"
              autoComplete="street-address"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="numero">
            <span>Número</span>
            <input
              id="numero"
              type="number"
              required
              min="0"
              value={form.Numero}
              onChange={(event) => setForm((current) => ({ ...current, Numero: event.target.value }))}
              placeholder="0"
              className="field-input"
              autoComplete="address-line2"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="complemento">
            <span>Complemento</span>
            <input
              id="complemento"
              type="text"
              required
              value={form.Complemento}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Complemento: event.target.value,
                }))
              }
              placeholder="Casa, bloco, sala..."
              className="field-input"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="pais">
            <span>País</span>
            <input
              id="pais"
              type="text"
              required
              value={form.Pais}
              onChange={(event) => setForm((current) => ({ ...current, Pais: event.target.value }))}
              placeholder="Brasil"
              className="field-input"
              autoComplete="country-name"
            />
          </label>
        </div>

        {error && (
          <p
            className="feedback-danger"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="feedback-success"
            aria-live="polite"
          >
            {success}
          </p>
        )}

        <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Cadastro de cliente com os campos mínimos exigidos pelo backend atual.</p>
          <span className="font-medium text-blue-600">Integração pronta para uso</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button-success w-full py-[1.125rem] disabled:opacity-80"
        >
          {loading ? "Criando cadastro..." : "Criar meu acesso"}
        </button>
      </form>
    </AuthShell>
  );
}

