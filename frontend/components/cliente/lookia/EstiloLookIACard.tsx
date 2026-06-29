"use client";

import type { EstiloLookIA } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type EstiloLookIACardProps = {
  estilo: EstiloLookIA;
  seleccionado: boolean;
  onSelect: (idEstiloLookIA: string) => void;
};

const obtenerCategoria = (estilo: EstiloLookIA) => {
  if (!estilo.categoria) return "Estilo LookIA";
  return typeof estilo.categoria === "string" ? estilo.categoria : estilo.categoria.nombre;
};

export function EstiloLookIACard({ estilo, seleccionado, onSelect }: EstiloLookIACardProps) {
  const estado = estilo.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <article
      className={`rounded-xl border bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 transition ${
        seleccionado
          ? "border-[#d4af37] ring-2 ring-[#d4af37]/20"
          : "border-[#d4af37]/20 hover:border-[#d4af37]/55"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {obtenerCategoria(estilo)}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{estilo.nombre}</h3>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>
      <p className="mt-4 min-h-16 text-sm leading-6 text-[#b5b5b5]">
        {estilo.descripcion ?? "Estilo disponible para probar con LookIA."}
      </p>
      <button
        className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-black transition ${
          seleccionado
            ? "border border-[#d4af37] bg-[#d4af37]/10 text-[#f5d77b]"
            : "bg-[#d4af37] text-black hover:bg-[#f5d77b]"
        }`}
        disabled={estilo.activo === false}
        onClick={() => onSelect(estilo.idEstiloLookIA)}
        type="button"
      >
        {seleccionado ? "Seleccionado" : "Seleccionar"}
      </button>
    </article>
  );
}
