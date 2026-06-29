import type { ReservaCliente } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type ReservaCalificableCardProps = {
  reserva: ReservaCliente;
  seleccionada: boolean;
  yaCalificada: boolean;
  onSelect: (reserva: ReservaCliente) => void;
};

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

const formatoMoneda = (monto?: number) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

export function ReservaCalificableCard({
  reserva,
  seleccionada,
  yaCalificada,
  onSelect
}: ReservaCalificableCardProps) {
  const nombreUsuarioBarbero =
    `${reserva.barbero?.usuario?.nombres ?? ""} ${
      reserva.barbero?.usuario?.apellidos ?? ""
    }`.trim() || "Barbero asignado";
  const barbero = reserva.barbero?.nombreProfesional ?? nombreUsuarioBarbero;

  return (
    <article
      className={`rounded-xl border bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 transition ${
        seleccionada ? "border-[#d4af37] ring-2 ring-[#d4af37]/20" : "border-[#d4af37]/20"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {reserva.servicio?.nombre ?? "Servicio"}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{barbero}</h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            {formatoFecha(reserva.fechaReserva)} · {reserva.horaInicio}
          </p>
        </div>
        <span className={getEstadoBadgeClass(reserva.estadoReserva)}>
          {reserva.estadoReserva}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Total</p>
          <p className="mt-1 font-black text-[#f5d77b]">{formatoMoneda(reserva.total)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Calificación</p>
          <p className="mt-1 font-black text-white">{yaCalificada ? "Ya calificada" : "Disponible"}</p>
        </div>
      </div>

      <button
        className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-black transition ${
          yaCalificada
            ? "cursor-not-allowed border border-white/10 bg-white/5 text-[#b5b5b5]"
            : "bg-[#d4af37] text-black hover:bg-[#f5d77b]"
        }`}
        disabled={yaCalificada}
        onClick={() => onSelect(reserva)}
        type="button"
      >
        {yaCalificada ? "Ya calificada" : seleccionada ? "Seleccionada" : "Seleccionar"}
      </button>
    </article>
  );
}
