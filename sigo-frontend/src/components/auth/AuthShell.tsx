"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { SigoBrand } from "@/components/branding/SigoBrand";

const performanceHighlights = [
  { label: "Operacoes rastreadas", value: "124+" },
  { label: "Atualizacoes em tempo real", value: "24/7" },
];

const workflowPillars = [
  "Recepcao organizada",
  "Execucao monitorada",
  "Pos-servico documentado",
];

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.18),transparent_22%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_36px_90px_-40px_rgba(15,23,42,0.42)] lg:grid-cols-[1.02fr_0.98fr]">
          <section className="relative isolate flex min-h-[420px] flex-col justify-between overflow-hidden border-b border-slate-200 lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <Image
              src="/profissional.jpg"
              alt="Profissional realizando manutencao automotiva"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.54)_48%,rgba(15,23,42,0.92)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,197,253,0.34),transparent_30%),linear-gradient(145deg,rgba(37,99,235,0.22),rgba(15,23,42,0.28)_42%,rgba(15,23,42,0.6)_100%)]" />

            <div className="relative flex items-start justify-between gap-4 px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="rounded-[16px] border border-white/18 bg-white/10 px-4 py-3 backdrop-blur-md">
                <SigoBrand
                  size={42}
                  subtitle="Oficina conectada"
                  containerClassName="flex items-center gap-3"
                  imageWrapperClassName="overflow-hidden rounded-[12px] border border-white/12 bg-white/90 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.55)]"
                  titleClassName="text-sm font-semibold uppercase tracking-[0.28em] text-white"
                  subtitleClassName="mt-1 text-[11px] uppercase tracking-[0.28em] text-blue-100/78"
                />
              </div>

              <div className="hidden rounded-[16px] border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-md sm:block">
                <p className="text-[11px] uppercase tracking-[0.3em] text-blue-100/76">
                  Performance
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">+38%</p>
                <p className="text-sm text-blue-50/78">mais previsibilidade operacional</p>
              </div>
            </div>

            <div className="relative px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
              <div className="max-w-xl">
                <SigoBrand
                  size={48}
                  subtitle="Gestao inteligente para oficinas e clientes"
                  containerClassName="flex items-center gap-4"
                  imageWrapperClassName="overflow-hidden rounded-[14px] border border-white/14 bg-white/92 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.65)]"
                  titleClassName="text-base font-semibold uppercase tracking-[0.34em] text-white"
                  subtitleClassName="mt-1 text-sm text-blue-100/78"
                />
                <h1 className="mt-5 max-w-lg text-[2.45rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[3.2rem]">
                  A gestao da oficina com uma presenca mais confiante e profissional.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-blue-50/82 sm:text-base">
                  Uma entrada mais solida para acompanhar atendimento, execucao tecnica e status
                  de cada servico com a clareza que uma operacao moderna precisa.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {performanceHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[16px] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md"
                    >
                      <p className="text-2xl font-semibold text-white">{item.value}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-blue-100/80">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex items-center bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="absolute bottom-8 left-6 h-28 w-28 rounded-full border border-blue-100 bg-blue-50/80 blur-2xl" />

            <div className="relative z-10 w-full">
              <div className="inline-flex rounded-[16px] border border-slate-200/80 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.42)]">
                <SigoBrand
                  size={44}
                  subtitle="Sistema integrado para oficinas e clientes"
                  containerClassName="flex items-center gap-4"
                  imageWrapperClassName="overflow-hidden rounded-[12px] border border-blue-100 bg-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.45)]"
                  titleClassName="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600"
                  subtitleClassName="mt-1 text-sm text-slate-600"
                />
              </div>

              <div className="mt-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">
                  {eyebrow}
                </p>
                <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[3rem]">
                  {title}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">{description}</p>
              </div>

              {children}

              <div className="mt-8 rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.35)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">
                  Fluxo inteligente
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {workflowPillars.map((pillar) => (
                    <div
                      key={pillar}
                      className="rounded-[12px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-600"
                    >
                      {pillar}
                    </div>
                  ))}
                </div>
              </div>

              {footer}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
