import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
  icon?: ReactNode;
}

export function StatCard({ title, value, helper, trend, icon }: StatCardProps) {
  const hasIcon = Boolean(icon);

  return (
    <div className="app-card relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(37,99,235,0.92),rgba(96,165,250,0.35),transparent)]" />
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="metric-kicker">
              {title}
            </p>
            <p className="mt-4 text-[2.2rem] font-semibold tracking-normal text-slate-950">
              {value}
            </p>
          </div>
          {hasIcon && (
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-blue-100 bg-blue-50 text-blue-700 shadow-[0_14px_24px_-18px_rgba(37,99,235,0.4)]">
              {icon}
            </span>
          )}
        </div>
        {helper && (
          <p className="max-w-[18rem] text-sm leading-6 text-slate-500">
            {helper}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-3 border-t border-slate-200/80 pt-4">
            <span
              className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-normal ${
                trend.positive
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {trend.value}
            </span>
            <span className="text-sm text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
