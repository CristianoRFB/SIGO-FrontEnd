interface SectionHeaderProps {
  title: string;
  description?: string;
  actionSlot?: React.ReactNode;
}

export function SectionHeader({ title, description, actionSlot }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
          Modulo
        </p>
        <h3 className="text-[1.35rem] font-semibold tracking-normal text-slate-950">
          {title}
        </h3>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actionSlot && <div className="flex flex-wrap items-center gap-3">{actionSlot}</div>}
    </div>
  );
}
