import type { BloqueoHorario } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type BloqueoCardProps = {
  bloqueo: BloqueoHorario;
  onEliminar: (bloqueo: BloqueoHorario) => void;
};

const formatoFecha = (fecha: string) =>
  new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));

const formatoHora = (fecha: string) =>
  new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date(fecha));

export function BloqueoCard({ bloqueo, onEliminar }: BloqueoCardProps) {
  const estado = bloqueo.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {formatoFecha(bloqueo.fechaInicio)}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {formatoHora(bloqueo.fechaInicio)} - {formatoHora(bloqueo.fechaFin)}
          </h3>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>
      <p className="mt-4 rounded-lg border border-white/10 bg-[#171717] p-3 text-sm leading-6 text-[#b5b5b5]">
        {bloqueo.motivo ?? "Sin motivo registrado."}
      </p>
      <button
        className="mt-5 w-full rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10"
        onClick={() => onEliminar(bloqueo)}
        type="button"
      >
        Eliminar
      </button>
    </article>
  );
}
