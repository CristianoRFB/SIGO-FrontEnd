"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SigoBrand } from "@/components/branding/SigoBrand";
import { clientNavigation, getClientMeta } from "@/lib/client-navigation";
import { AUTH_CHANGE_EVENT, clearToken, getUserFromToken } from "@/services/auth";
import type { AuthUser } from "@/types/entities";

interface ClienteShellProps {
  children: ReactNode;
}

export function ClienteShell({ children }: ClienteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = getClientMeta(pathname);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(getUserFromToken());
    }

    syncUser();
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
    };
  }, []);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1560px] gap-5 px-4 py-5 lg:px-8 lg:py-8">
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-8 overflow-hidden rounded-[24px] border border-blue-950/20 bg-[linear-gradient(180deg,#10213f,#153169,#1d4ed8)] text-white shadow-[0_32px_80px_-38px_rgba(29,78,216,0.58)]">
            <div className="border-b border-white/12 px-7 py-7">
              <SigoBrand
                size={50}
                subtitle="Portal do cliente"
                containerClassName="flex items-center gap-4"
                imageWrapperClassName="overflow-hidden rounded-[14px] border border-white/14 bg-white/92 shadow-[0_18px_34px_-22px_rgba(15,23,42,0.55)]"
                titleClassName="text-base font-semibold uppercase tracking-[0.3em] text-white"
                subtitleClassName="mt-1 text-sm text-blue-100/76"
              />
              <p className="mt-3 text-sm leading-6 text-blue-50/84">
                Acompanhe veiculos, servicos, pedidos e relatorios em um ambiente mais direto e profissional.
              </p>
            </div>

            <nav className="space-y-1 px-4 py-5">
              {clientNavigation.map((item) => {
                const isActive = item.href === pathname;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[14px] border px-4 py-3.5 text-sm font-medium transition ${
                      isActive
                        ? "border-white/18 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border-transparent text-blue-100/82 hover:border-white/8 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[12px] border text-xs font-semibold ${
                        isActive
                          ? "border-white/12 bg-white/16 text-white"
                          : "border-white/8 bg-white/6 text-blue-50"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-blue-100/60">
                      {isActive ? "Atual" : "Ir"}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/12 px-5 py-5">
              <div className="rounded-[18px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-100/75">
                  Sessao ativa
                </p>
                <p className="mt-3 text-base font-semibold text-white">
                  {user?.name || "Cliente autenticado"}
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-50/78">
                  {user?.email || "Use este ambiente para acompanhar seu atendimento sem precisar falar com a oficina a todo momento."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-[10px] border border-rose-300/28 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-50 hover:bg-rose-400/16"
              >
                Sair
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="app-panel mb-4 flex items-center justify-between gap-3 px-5 py-4 xl:hidden">
            <SigoBrand
              size={36}
              subtitle={user?.name || "Portal do cliente"}
              containerClassName="flex items-center gap-3"
              imageWrapperClassName="overflow-hidden rounded-[10px] border border-blue-100 bg-white shadow-[0_10px_22px_-18px_rgba(37,99,235,0.45)]"
              titleClassName="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600"
              subtitleClassName="mt-1 text-sm font-semibold text-slate-900"
            />
            <button
              type="button"
              onClick={handleLogout}
              className="button-cancel"
            >
              Sair
            </button>
          </div>

          <nav className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:hidden">
            {clientNavigation.map((item) => {
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

          <header className="app-panel overflow-hidden">
            <div className="flex flex-col gap-5 px-6 py-6 lg:px-8 lg:py-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-[14px] border border-slate-200/80 bg-white/88 px-3 py-2 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)]">
                    <SigoBrand
                      size={34}
                      subtitle="Cliente / Atendimento"
                      containerClassName="flex items-center gap-3"
                      imageWrapperClassName="overflow-hidden rounded-[10px] border border-blue-100 bg-white"
                      titleClassName="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600"
                      subtitleClassName="mt-0.5 text-xs text-slate-500"
                    />
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 lg:text-[2.25rem]">
                    {currentPage.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {currentPage.subtitle}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-blue-100 bg-blue-50/80 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
                      Conta
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {user?.name || "Cliente"}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Navegacao
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {currentPage.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
