"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SigoBrand } from "@/components/branding/SigoBrand";
import type { UserRole } from "@/types/entities";
import { clearToken, getUserFromToken } from "@/services/auth";

interface SessionGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectOnForbidden: string;
  redirectOnUnauthenticated?: string;
}

export function SessionGuard({
  children,
  allowedRoles,
  redirectOnForbidden,
  redirectOnUnauthenticated = "/login",
}: SessionGuardProps) {
  const router = useRouter();

  const access = useMemo(() => {
    const user = getUserFromToken();

    if (!user) {
      return {
        allowed: false,
        redirectTo: redirectOnUnauthenticated,
        shouldClearToken: true,
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        redirectTo: redirectOnForbidden,
        shouldClearToken: false,
      };
    }

    return {
      allowed: true,
      redirectTo: null,
      shouldClearToken: false,
    };
  }, [allowedRoles, redirectOnForbidden, redirectOnUnauthenticated]);

  useEffect(() => {
    if (access.allowed || !access.redirectTo) {
      return;
    }

    if (access.shouldClearToken) {
      clearToken();
    }

    router.replace(access.redirectTo);
  }, [access, router]);

  if (!access.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8ff] px-4">
        <div className="app-panel w-full max-w-md border-blue-100 p-8 text-center">
          <div className="flex justify-center">
            <SigoBrand
              size={56}
              subtitle="Validacao de sessao"
              containerClassName="flex items-center gap-4 text-left"
              imageWrapperClassName="overflow-hidden rounded-[14px] border border-blue-100 bg-white shadow-[0_18px_34px_-22px_rgba(37,99,235,0.35)]"
              titleClassName="text-xs font-semibold uppercase tracking-normal text-blue-600"
              subtitleClassName="mt-1 text-sm text-slate-500"
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Validando seu acesso
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Estamos conferindo sua sessao para abrir o ambiente correto.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
