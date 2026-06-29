import Link from "next/link";
import type { Notificacion } from "@/lib/types";

type NotificacionCardProps = {
  notificacion: Notificacion;
  cargando?: boolean;
  onMarcarLeida: (idNotificacion: string) => void;
};

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
};

const claseTipo = (tipo: string) => {
  if (tipo.startsWith("RESERVA_")) return "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f5d77b]";
  if (tipo.startsWith("PAGO_")) return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  if (tipo.startsWith("PORTAFOLIO_")) return "border-red-500/30 bg-red-500/10 text-red-200";
  if (tipo.startsWith("CALIFICACION_")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  return "border-white/10 bg-white/5 text-[#b5b5b5]";
};

const metadataString = (metadata: Record<string, unknown> | null | undefined, key: string) => {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
};

const rutaContextual = (notificacion: Notificacion) => {
  const idReserva = metadataString(notificacion.metadata, "idReserva");
  if (notificacion.tipo.startsWith("RESERVA_")) {
    return idReserva ? `/barbero/reservas/${idReserva}` : "/barbero/reservas";
  }
  if (notificacion.tipo.startsWith("PAGO_")) {
    return idReserva ? `/barbero/reservas/${idReserva}` : "/barbero/reservas";
  }
  if (notificacion.tipo === "PORTAFOLIO_MODERADO") return "/barbero/portafolio";
  if (notificacion.tipo === "CALIFICACION_RECIBIDA") return "/barbero/reservas";
  return undefined;
};

export function NotificacionCard({ notificacion, cargando = false, onMarcarLeida }: NotificacionCardProps) {
  const ruta = rutaContextual(notificacion);

  return (
    <article
      className={`rounded-xl border p-5 shadow-xl shadow-black/20 ${
        notificacion.leida
          ? "border-white/10 bg-[#0d0d0d]"
          : "border-[#d4af37]/45 bg-[#d4af37]/10"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${claseTipo(notificacion.tipo)}`}>
            {notificacion.tipo.replace(/_/g, " ")}
          </span>
          <h3 className="mt-3 text-xl font-black text-white">{notificacion.titulo}</h3>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">{notificacion.mensaje}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${
          notificacion.leida
            ? "border-white/10 bg-white/5 text-[#b5b5b5]"
            : "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f5d77b]"
        }`}>
          {notificacion.leida ? "Leída" : "No leída"}
        </span>
      </div>
      <p className="mt-4 text-xs text-[#b5b5b5]">{formatoFecha(notificacion.fechaCreacion)}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!notificacion.leida ? (
          <button
            className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={cargando}
            onClick={() => onMarcarLeida(notificacion.idNotificacion)}
            type="button"
          >
            Marcar como leída
          </button>
        ) : null}
        {ruta ? (
          <Link
            className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-center text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
            href={ruta}
          >
            Ver relacionado
          </Link>
        ) : null}
      </div>
    </article>
  );
}
