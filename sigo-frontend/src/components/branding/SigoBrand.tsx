"use client";

import Image from "next/image";

interface SigoBrandProps {
  subtitle?: string;
  size?: number;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
  imageWrapperClassName?: string;
  imageClassName?: string;
}

export function SigoBrand({
  subtitle,
  size = 48,
  titleClassName = "text-lg font-semibold text-slate-900",
  subtitleClassName = "text-sm text-slate-500",
  containerClassName = "flex items-center gap-3",
  imageWrapperClassName = "overflow-hidden rounded-[14px] border border-white/10 bg-white/90 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.45)]",
  imageClassName = "h-full w-full object-cover",
}: SigoBrandProps) {
  return (
    <div className={containerClassName}>
      <div
        className={imageWrapperClassName}
        style={{ height: size, width: size }}
      >
        <Image
          src="/logo_siga.jpg"
          alt="Logo do SIGO"
          width={size}
          height={size}
          className={imageClassName}
        />
      </div>

      <div className="min-w-0">
        <p className={titleClassName}>SIGO</p>
        {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
      </div>
    </div>
  );
}
