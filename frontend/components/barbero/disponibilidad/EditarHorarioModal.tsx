"use client";

import { HorarioForm } from "@/components/barbero/disponibilidad/HorarioForm";
import type { DiaSemana, HorarioDisponibilidad } from "@/lib/types";

type EditarHorarioModalProps = {
  abierto: boolean;
  horario: HorarioDisponibilidad | null;
  cargando?: boolean;
  onCancel: () => void;
  onSubmit: (payload: { diaSemana: DiaSemana; horaInicio: string; horaFin: string }) => void;
};

export function EditarHorarioModal({
  abierto,
  horario,
  cargando = false,
  onCancel,
  onSubmit
}: EditarHorarioModalProps) {
  if (!abierto || !horario) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Disponibilidad
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Editar horario recurrente</h2>
        <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
          Ajusta el día o el rango horario recurrente.
        </p>
        <div className="mt-5">
          <HorarioForm
            cargando={cargando}
            horario={horario}
            submitLabel="Guardar cambios"
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
