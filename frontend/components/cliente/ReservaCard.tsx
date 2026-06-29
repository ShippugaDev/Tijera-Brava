import type { ReservaCliente } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

const estadosCancelables = ["PENDIENTE", "CONFIRMADA"];

export function ReservaCard({
  reserva,
  onCancelar
}: {
  reserva: ReservaCliente;
  onCancelar?: (idReserva: string) => void;
}) {
  const puedeCancelar = estadosCancelables.includes(reserva.estadoReserva);

  return (
    <article className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d4af37]">
            {reserva.fechaReserva} · {reserva.horaInicio}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {reserva.servicio?.nombre ?? "Servicio de barbería"}
          </h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            Barbero: {reserva.barbero?.nombreProfesional ?? reserva.barbero?.usuario?.nombres ?? "Asignado"}
          </p>
        </div>
        <span className={getEstadoBadgeClass(reserva.estadoReserva)}>
          {reserva.estadoReserva}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-xs text-[#b5b5b5]">Pago</p>
          <p className="mt-1 font-black">{reserva.metodoPago ?? "-"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-xs text-[#b5b5b5]">Total</p>
          <p className="mt-1 font-black">S/ {Number(reserva.total ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-xs text-[#b5b5b5]">Zona</p>
          <p className="mt-1 font-black">{reserva.zonaCobertura?.nombre ?? "-"}</p>
        </div>
      </div>
      {reserva.indicacionesCliente ? (
        <p className="mt-4 text-sm leading-6 text-[#b5b5b5]">{reserva.indicacionesCliente}</p>
      ) : null}
      {puedeCancelar && onCancelar ? (
        <button
          className="mt-5 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-950/30"
          onClick={() => onCancelar(reserva.idReserva)}
          type="button"
        >
          Cancelar reserva
        </button>
      ) : null}
    </article>
  );
}
