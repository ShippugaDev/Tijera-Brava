import { ReservaEstadoActions, type AccionReservaBarbero } from "@/components/barbero/reservas/ReservaEstadoActions";
import { ReservaEstadoBadge } from "@/components/barbero/reservas/ReservaEstadoBadge";
import type { ReservaBarbero } from "@/lib/types";

type ReservaDetalleBarberoProps = {
  reserva: ReservaBarbero;
  accionEnCurso?: boolean;
  onAction: (accion: AccionReservaBarbero) => void;
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

export function ReservaDetalleBarbero({
  reserva,
  accionEnCurso = false,
  onAction
}: ReservaDetalleBarberoProps) {
  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Detalle de reserva
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {reserva.servicio?.nombre ?? "Servicio de barbería"}
          </h2>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            {formatoFecha(reserva.fechaReserva)} · {reserva.horaInicio}
            {reserva.horaFin ? ` - ${reserva.horaFin}` : ""}
          </p>
        </div>
        <ReservaEstadoBadge estado={reserva.estadoReserva} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Dato titulo="Cliente" valor={clienteNombre(reserva)} />
        <Dato
          titulo="Teléfono"
          valor={reserva.cliente?.usuario?.telefono ?? reserva.cliente?.telefono ?? "No disponible"}
        />
        <Dato titulo="Método de pago" valor={reserva.metodoPago ?? "No especificado"} />
        <Dato titulo="Total" valor={formatoMoneda(reserva.total)} destacado />
        <Dato
          titulo="Zona"
          valor={reserva.zonaCobertura?.distrito ?? reserva.zonaCobertura?.nombre ?? "No disponible"}
        />
        <Dato titulo="Servicio" valor={reserva.servicio?.nombre ?? "No disponible"} />
      </div>

      <div className="mt-5 grid gap-4">
        <Bloque titulo="Indicaciones del cliente" valor={reserva.indicacionesCliente ?? "Sin indicaciones."} />
        {reserva.motivoCancelacion ? (
          <Bloque titulo="Motivo de cancelación" valor={reserva.motivoCancelacion} />
        ) : null}
        {reserva.pago ? (
          <Bloque
            titulo="Pago asociado"
            valor={`${reserva.pago.estadoPago} · ${formatoMoneda(reserva.pago.montoTotal)}`}
          />
        ) : null}
      </div>

      <div className="mt-6">
        <ReservaEstadoActions
          disabled={accionEnCurso}
          estado={reserva.estadoReserva}
          onAction={onAction}
        />
      </div>
    </section>
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
      <p className="text-sm text-[#b5b5b5]">{titulo}</p>
      <p className={`mt-1 text-sm font-black ${destacado ? "text-[#f5d77b]" : "text-white"}`}>
        {valor}
      </p>
    </div>
  );
}

function Bloque({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-4">
      <p className="text-sm font-black text-white">{titulo}</p>
      <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">{valor}</p>
    </div>
  );
}
