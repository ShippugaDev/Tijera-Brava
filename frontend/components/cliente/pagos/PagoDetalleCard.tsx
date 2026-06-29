import type { PagoCliente, ReservaCliente } from "@/lib/types";
import { PagoBadge } from "@/components/cliente/pagos/PagoBadge";

const formatoFecha = (fecha?: string | null) => {
  if (!fecha) return "No disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
};

const formatoMoneda = (monto?: number) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

export function PagoDetalleCard({
  pago,
  reserva
}: {
  pago: PagoCliente;
  reserva?: ReservaCliente;
}) {
  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Detalle de pago
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{formatoMoneda(pago.montoTotal)}</h2>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            Método: {pago.metodoPago ?? reserva?.metodoPago ?? "No especificado"}
          </p>
        </div>
        <PagoBadge estado={pago.estadoPago} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Dato titulo="Monto servicio" valor={formatoMoneda(pago.montoServicio)} />
        <Dato titulo="Monto traslado" valor={formatoMoneda(pago.montoTraslado)} />
        <Dato titulo="Código de operación" valor={pago.codigoOperacion ?? "No registrado"} />
        <Dato titulo="Comprobante" valor={pago.comprobanteUrl ?? "No registrado"} breakAll />
        <Dato titulo="Observación" valor={pago.observacion ?? "Sin observación"} />
        <Dato titulo="Confirmación" valor={formatoFecha(pago.fechaConfirmacion)} />
        <Dato titulo="Creación" valor={formatoFecha(pago.fechaCreacion)} />
        <Dato titulo="Actualización" valor={formatoFecha(pago.fechaActualizacion)} />
      </div>

      {reserva ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-[#171717] p-4">
          <p className="text-sm font-black text-white">Reserva</p>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
            {reserva.servicio?.nombre ?? "Servicio"} con{" "}
            {reserva.barbero?.nombreProfesional ?? "barbero asignado"} el {reserva.fechaReserva} a
            las {reserva.horaInicio}.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Dato({
  titulo,
  valor,
  breakAll = false
}: {
  titulo: string;
  valor: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
      <p className="text-sm text-[#b5b5b5]">{titulo}</p>
      <p className={`mt-1 text-sm font-black text-white ${breakAll ? "break-all" : ""}`}>{valor}</p>
    </div>
  );
}
