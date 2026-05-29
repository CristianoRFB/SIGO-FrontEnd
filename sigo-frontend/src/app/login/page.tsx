"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  getUserRole,
  isInvalidCredentialsError,
  loginCliente,
  loginFuncionario,
  loginOficina,
  setToken,
} from "@/services/auth";
import { ApiError, getErrorMessage } from "@/services/errors";

type LoginAccess = "cliente" | "oficina" | "equipe";

const ACCESS_OPTIONS: Array<{
  value: LoginAccess;
  label: string;
  description: string;
}> = [
  {
    value: "cliente",
    label: "Cliente",
    description: "Acompanhe veiculos, pedidos e relatorios.",
  },
  {
    value: "oficina",
    label: "Oficina",
    description: "Entre como responsavel pela operacao da oficina.",
  },
  {
    value: "equipe",
    label: "Equipe/Admin",
    description: "Acesso para funcionarios e administradores.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState<LoginAccess>("cliente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();

    if (role === "Cliente") {
      router.replace("/cliente");
      return;
    }

    if (role === "Admin" || role === "Funcionario" || role === "Oficina") {
      router.replace("/visao-geral");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe o e-mail e a senha para continuar.");
      return;
    }

    try {
      setLoading(true);

      const token =
        access === "cliente"
          ? await loginCliente(email, password)
          : access === "oficina"
            ? await loginOficina(email, password)
            : await loginFuncionario(email, password);

      setToken(token);

      const role = getUserRole(token);

      if (role === "Cliente") {
        router.replace("/cliente");
        return;
      }

      if (role === "Admin" || role === "Funcionario" || role === "Oficina") {
        router.replace("/visao-geral");
        return;
      }

      throw new Error("Nao foi possivel identificar o perfil do usuario.");
    } catch (currentError) {
      if (currentError instanceof ApiError && currentError.status === 429) {
        setError("Muitas tentativas de login. Aguarde 1 minuto e tente novamente.");
        return;
      }

      if (isInvalidCredentialsError(currentError)) {
        setError("E-mail ou senha incorretos para o perfil selecionado.");
        return;
      }

      setError(
        getErrorMessage(
          currentError,
          "Falha ao autenticar. Verifique suas credenciais e tente novamente."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acesso seguro"
      title="Entre para acompanhar seu atendimento e sua operacao em tempo real."
      description="Clientes acompanham seus veiculos e pedidos. Oficina, administradores e funcionarios seguem para o painel operacional."
      footer={
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Nao tem acesso ainda?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Cadastre-se
            </Link>
          </p>
          <p className="mt-3">Â© {new Date().getFullYear()} SIGO. Todos os direitos reservados.</p>
        </div>
      }
    >
      <form className="mt-10 space-y-6 rounded-[18px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.25)]" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">Tipo de acesso</p>
            <span className="text-xs font-medium uppercase tracking-normal text-slate-400">
              escolha antes de entrar
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {ACCESS_OPTIONS.map((option) => {
              const isActive = access === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAccess(option.value)}
                  className={[
                    "rounded-[14px] border px-4 py-4 text-left transition",
                    isActive
                      ? "border-blue-500 bg-blue-600 text-white shadow-[0_18px_30px_-22px_rgba(37,99,235,0.9)]"
                      : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-blue-200 hover:bg-blue-50/70",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p
                    className={[
                      "mt-2 text-xs leading-5",
                      isActive ? "text-blue-50/88" : "text-slate-500",
                    ].join(" ")}
                  >
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="email">
            <span>E-mail</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@empresa.com"
              className="field-input"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="password">
            <span>Senha</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="field-input"
              autoComplete="current-password"
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

        <div className="flex flex-col gap-4 rounded-[14px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-2 focus:ring-blue-300"
            />
            Manter sessao ativa neste dispositivo
          </label>
          <span className="font-medium text-blue-600">
            Perfil atual: {ACCESS_OPTIONS.find((option) => option.value === access)?.label}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button-success w-full py-3.5 disabled:opacity-80"
        >
          {loading ? "Entrando..." : "Entrar no SIGO"}
        </button>
      </form>
    </AuthShell>
  );
}
