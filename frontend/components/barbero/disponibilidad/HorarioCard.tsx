import type { HorarioDisponibilidad } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type HorarioCardProps = {
  horario: HorarioDisponibilidad;
  onEditar: (horario: HorarioDisponibilidad) => void;
  onEliminar: (horario: HorarioDisponibilidad) => void;
};

export function HorarioCard({ horario, onEditar, onEliminar }: HorarioCardProps) {
  const estado = horario.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {horario.diaSemana}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {horario.horaInicio} - {horario.horaFin}
          </h3>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
          onClick={() => onEditar(horario)}
          type="button"
        >
          Editar
        </button>
        <button
          className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10"
          onClick={() => onEliminar(horario)}
          type="button"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
