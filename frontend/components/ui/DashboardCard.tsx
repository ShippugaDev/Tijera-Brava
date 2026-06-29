import Link from "next/link";
import type { ReactNode } from "react";

type DashboardCardProps = {
  icono: string;
  titulo: string;
  descripcion: string;
  accion?: string;
  href?: string;
};

export function DashboardCard({
  icono,
  titulo,
  descripcion,
  accion = "Ver módulo",
  href
}: DashboardCardProps) {
  const card = (
    <article className="group rounded-xl border border-[#d4af37]/18 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#d4af37]/55">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 text-sm font-black text-[#f5d77b]">
          {icono}
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37] opacity-80">
          {accion}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-black text-white">{titulo}</h3>
      <p className="mt-3 min-h-12 text-sm leading-6 text-[#b5b5b5]">{descripcion}</p>
      <div className="mt-5 h-px bg-gradient-to-r from-[#d4af37]/60 to-transparent" />
    </article>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

export function SummaryCard({
  titulo,
  valor,
  detalle
}: {
  titulo: string;
  valor: ReactNode;
  detalle: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#171717] p-4">
      <p className="text-sm text-[#b5b5b5]">{titulo}</p>
      <p className="mt-2 text-2xl font-black text-white">{valor}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]">
        {detalle}
      </p>
    </article>
  );
}
