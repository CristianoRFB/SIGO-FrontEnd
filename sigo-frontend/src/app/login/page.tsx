"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const performanceHighlights = [
  { label: "Ordens em fluxo", value: "124+" },
  { label: "Alertas em tempo real", value: "24/7" },
];

const workflowPillars = ["Recepção conectada", "Execução rastreável", "Pós-serviço organizado"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe o e-mail e a senha para continuar");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8ff] font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.18),_transparent_24%)]" />
      <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-blue-100/80 bg-white shadow-[0_32px_90px_-38px_rgba(30,64,175,0.45)] lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative isolate flex min-h-[420px] flex-col justify-between overflow-hidden px-6 py-6 text-white sm:px-8 sm:py-8 lg:min-h-[720px] lg:px-10 lg:py-10">
            <Image
              src="/profissional.jpg"
              alt="Profissional realizando manutenção automotiva em uma oficina"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,38,0.2)_0%,rgba(8,15,38,0.62)_56%,rgba(8,15,38,0.94)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.36),_transparent_30%),linear-gradient(145deg,rgba(37,99,235,0.34),rgba(15,23,42,0.08)_42%,rgba(15,23,42,0.56)_100%)]" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.34em] text-blue-50 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Oficina automatizada
              </div>
              <div className="hidden rounded-3xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md sm:block">
                <p className="text-[11px] uppercase tracking-[0.32em] text-blue-100/80">Performance</p>
                <p className="mt-2 text-2xl font-semibold">+38%</p>
                <p className="text-sm text-blue-50/75">mais previsibilidade operacional</p>
              </div>
            </div>

            <div className="relative max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.34em] text-blue-100/80">SIGO</p>
              <h1 className="mt-5 max-w-lg text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[3.5rem]">
                Controle visual e inteligente para a rotina da sua oficina.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-blue-50/85 sm:text-base">
                Uma entrada mais elegante para acompanhar atendimento, execução técnica e status
                de cada serviço com a clareza que uma operação moderna precisa.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {performanceHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/18 bg-white/10 px-5 py-4 backdrop-blur-md"
                  >
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.28em] text-blue-100/80">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex items-center bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="absolute bottom-8 left-6 h-28 w-28 rounded-full border border-blue-100 bg-blue-50/80 blur-2xl" />

            <div className="relative z-10 w-full">
              <div className="inline-flex items-center gap-4 rounded-full border border-blue-100 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.45)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#60a5fa)] shadow-[0_16px_28px_-16px_rgba(37,99,235,0.8)]">
                  <span className="grid grid-cols-2 gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">
                    SIGO
                  </p>
                  <p className="text-sm text-slate-600">Sistema Inteligente de Gestão da Oficina</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-blue-600">
                  Acesso seguro
                </p>
                <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[3.15rem]">
                  Entre para acompanhar sua operação em tempo real.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  Um painel mais claro, sofisticado e alinhado ao ritmo de uma oficina conectada.
                </p>
              </div>

              <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-5">
                  <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="email">
                    <span>E-mail</span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="seuemail@empresa.com"
                      className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                      className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                      autoComplete="current-password"
                    />
                  </label>
                </div>

                {error && (
                  <p
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-2 focus:ring-blue-300"
                    />
                    Manter sessão ativa neste dispositivo
                  </label>
                  <span className="font-medium text-blue-600">Ambiente monitorado</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#60a5fa)] px-4 py-4 text-sm font-semibold text-white shadow-[0_24px_50px_-22px_rgba(37,99,235,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_55px_-22px_rgba(37,99,235,0.85)] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? "Entrando..." : "Entrar no painel"}
                </button>
              </form>

              <div className="mt-8 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98),rgba(219,234,254,0.9))] p-5 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">
                  Fluxo inteligente
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {workflowPillars.map((pillar) => (
                    <div
                      key={pillar}
                      className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_14px_32px_-28px_rgba(37,99,235,0.42)]"
                    >
                      {pillar}
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} SIGO. Todos os direitos reservados.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
