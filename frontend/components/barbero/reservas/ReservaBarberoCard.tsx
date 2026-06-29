import Link from "next/link";
import { ReservaEstadoActions, type AccionReservaBarbero } from "@/components/barbero/reservas/ReservaEstadoActions";
import { ReservaEstadoBadge } from "@/components/barbero/reservas/ReservaEstadoBadge";
import type { ReservaBarbero } from "@/lib/types";

type ReservaBarberoCardProps = {
  reserva: ReservaBarbero;
  accionEnCurso?: boolean;
  onAction: (reserva: ReservaBarbero, accion: AccionReservaBarbero) => void;
};

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

const formatoMoneda = (monto?: number) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

const clienteNombre = (reserva: ReservaBarbero) =>
  `${reserva.cliente?.usuario?.nombres ?? reserva.cliente?.nombres ?? ""} ${
    reserva.cliente?.usuario?.apellidos ?? reserva.cliente?.apellidos ?? ""
  }`.trim() || "Cliente";

export function ReservaBarberoCard({ reserva, accionEnCurso = false, onAction }: ReservaBarberoCardProps) {
  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {reserva.servicio?.nombre ?? "Servicio de barbería"}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{clienteNombre(reserva)}</h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            {formatoFecha(reserva.fechaReserva)} · {reserva.horaInicio}
            {reserva.horaFin ? ` - ${reserva.horaFin}` : ""}
          </p>
        </div>
        <ReservaEstadoBadge estado={reserva.estadoReserva} />
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <Dato titulo="Método" valor={reserva.metodoPago ?? "No especificado"} />
        <Dato titulo="Total" valor={formatoMoneda(reserva.total)} destacado />
        <Dato
          titulo="Zona"
          valor={reserva.zonaCobertura?.distrito ?? reserva.zonaCobertura?.nombre ?? "No disponible"}
        />
      </div>

      {reserva.indicacionesCliente ? (
        <p className="mt-4 rounded-lg border border-white/10 bg-[#171717] p-3 text-sm leading-6 text-[#b5b5b5]">
          {reserva.indicacionesCliente}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ReservaEstadoActions
          disabled={accionEnCurso}
          estado={reserva.estadoReserva}
          onAction={(accion) => onAction(reserva, accion)}
        />
        <Link
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-center text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
          href={`/barbero/reservas/${reserva.idReserva}`}
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

function Dato({
  titulo,
  valor,
  destacado = false
}: {
  titulo: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
      <p className="text-[#b5b5b5]">{titulo}</p>
      <p className={`mt-1 font-black ${destacado ? "text-[#f5d77b]" : "text-white"}`}>{valor}</p>
    </div>
  );
}
