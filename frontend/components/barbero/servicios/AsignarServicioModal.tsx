"use client";

import { ServicioAsignacionForm } from "@/components/barbero/servicios/ServicioAsignacionForm";
import type { ServicioCatalogo } from "@/lib/types";

type AsignarServicioModalProps = {
  abierto: boolean;
  servicio: ServicioCatalogo | null;
  cargando?: boolean;
  onCancel: () => void;
  onSubmit: (payload: { precioPersonalizado: number; duracionPersonalizada: number }) => void;
};

export function AsignarServicioModal({
  abierto,
  servicio,
  cargando = false,
  onCancel,
  onSubmit
}: AsignarServicioModalProps) {
  if (!abierto || !servicio) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Servicio
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Agregar {servicio.nombre}</h2>
        <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
          Define el precio y duración que ofrecerás para este servicio.
        </p>
        <div className="mt-5">
          <ServicioAsignacionForm
            cargando={cargando}
            servicioCatalogo={servicio}
            submitLabel="Agregar servicio"
            onSubmit={onSubmit}
          />
        </div>
        <button
          className="mt-4 w-full rounded-lg border border-white/10 px-5 py-3 text-sm font-black text-[#b5b5b5] transition hover:border-[#d4af37]/40 hover:text-white"
          disabled={cargando}
          onClick={onCancel}
          type="button"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
