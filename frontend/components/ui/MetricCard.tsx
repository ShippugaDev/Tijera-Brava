import type { ReactNode } from "react";

type MetricCardProps = {
  titulo: string;
  valor: ReactNode;
  detalle?: string;
};

export function MetricCard({ titulo, valor, detalle = "Métrica del sistema" }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#171717] p-5 shadow-xl shadow-black/20 transition hover:border-[#d4af37]/50">
      <p className="text-sm font-semibold text-[#b5b5b5]">{titulo}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{valor}</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
        {detalle}
      </p>
    </article>
  );
}
