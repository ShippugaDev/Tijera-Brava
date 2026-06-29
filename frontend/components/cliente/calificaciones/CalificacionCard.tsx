import type { CalificacionCliente } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

const estrellas = (puntuacion: number) => "★".repeat(puntuacion).padEnd(5, "☆");

export function CalificacionCard({ calificacion }: { calificacion: CalificacionCliente }) {
  const barbero =
    calificacion.barbero?.nombreProfesional ??
    `${calificacion.barbero?.nombres ?? ""} ${calificacion.barbero?.apellidos ?? ""}`.trim() ??
    "Barbero";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Servicio de barbería
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{barbero || "Barbero"}</h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            Reserva {calificacion.reserva?.idReserva ?? calificacion.idReserva}
          </p>
        </div>
        <span className={getEstadoBadgeClass(calificacion.estadoVisibilidad ?? "VISIBLE")}>
          {calificacion.estadoVisibilidad ?? "VISIBLE"}
        </span>
      </div>

      <p className="mt-4 text-2xl tracking-wide text-[#f5d77b]">{estrellas(calificacion.puntuacion)}</p>
      <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
        {calificacion.comentario ?? "Sin comentario registrado."}
      </p>
      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Fecha</p>
          <p className="mt-1 font-black text-white">{formatoFecha(calificacion.fechaCreacion)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Estado reserva</p>
          <p className="mt-1">
            <span className={getEstadoBadgeClass(calificacion.reserva?.estadoReserva)}>
              {calificacion.reserva?.estadoReserva ?? "No disponible"}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
