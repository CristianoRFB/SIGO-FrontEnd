"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { SigoBrand } from "@/components/branding/SigoBrand";
import { getPanelMeta, panelNavigation } from "@/lib/panel-navigation";
import { getUserFromToken } from "@/services/auth";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentPage = getPanelMeta(pathname);
  const visibleNavigation = useMemo(() => {
    const role = getUserFromToken()?.role;
    return panelNavigation.filter(
      (item) => item.href !== "/pedidos" || role === "Admin" || role === "Oficina"
    );
  }, []);

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen w-full gap-4 px-3 py-4 sm:px-5 lg:px-6 xl:gap-5 xl:px-8 2xl:px-10">
        <aside className="hidden w-[18rem] shrink-0 xl:block">
          <div className="sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[24px] border border-slate-800 bg-[linear-gradient(180deg,#0f172a,#111c34,#172554)] text-white shadow-[0_32px_80px_-38px_rgba(15,23,42,0.72)]">
            <div className="border-b border-white/10 px-7 py-7">
              <SigoBrand
                size={48}
                subtitle="Painel operacional"
                containerClassName="flex items-center gap-4"
                imageWrapperClassName="overflow-hidden rounded-[14px] border border-white/12 bg-white/92 shadow-[0_18px_34px_-22px_rgba(15,23,42,0.55)]"
                titleClassName="text-sm font-semibold uppercase tracking-normal text-white"
                subtitleClassName="mt-1 text-sm text-blue-100/74"
              />
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                Painel operacional
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Controle clientes, equipe, servicos e veiculos em um ambiente mais claro e orientado a decisao.
              </p>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-5">
              {visibleNavigation.map((item) => {
                const isActive = item.href === pathname;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[14px] border px-4 py-3.5 text-sm font-medium transition ${
                      isActive
                        ? "border-blue-300/30 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border-transparent text-slate-300 hover:border-white/8 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[12px] border text-xs font-semibold ${
                        isActive
                          ? "border-white/12 bg-blue-400/15 text-blue-100"
                          : "border-white/10 bg-white/6 text-slate-200"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[11px] uppercase tracking-normal text-slate-400">
                      {isActive ? "Atual" : "Ir"}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 px-5 py-5">
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-200/80">
                  Ambiente
                </p>
                <p className="mt-3 text-base font-semibold text-white">Visao consolidada</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Acesse seus modulos por pagina, com filtros, cadastros e indicadores mais organizados.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <nav className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:hidden">
            {visibleNavigation.map((item) => {
              const isActive = item.href === pathname;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-12 items-center justify-center rounded-[10px] border px-4 py-2.5 text-center text-sm font-medium transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <header className="app-panel mb-6 overflow-hidden">
            <div className="flex flex-col gap-5 px-6 py-6 lg:px-8 lg:py-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-[14px] border border-slate-200/80 bg-white/88 px-3 py-2 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)]">
                    <SigoBrand
                      size={34}
                      subtitle="Gestao"
                      containerClassName="flex items-center gap-3"
                      imageWrapperClassName="overflow-hidden rounded-[10px] border border-blue-100 bg-white"
                      titleClassName="text-[11px] font-semibold uppercase tracking-normal text-blue-600"
                      subtitleClassName="mt-0.5 text-xs text-slate-500"
                    />
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 lg:text-[2.35rem]">
                    {currentPage.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {currentPage.subtitle}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-500">
                      Navegacao
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {currentPage.label}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-blue-100 bg-blue-50/80 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Operacao ativa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
