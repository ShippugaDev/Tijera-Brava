import Link from "next/link";
import type { ReservaCliente } from "@/lib/types";
import { PagoBadge } from "@/components/cliente/pagos/PagoBadge";
import { getEstadoBadgeClass } from "@/lib/status-styles";

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

const formatoMoneda = (monto?: number) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

export function PagoReservaCard({ reserva }: { reserva: ReservaCliente }) {
  const pago = reserva.pago;
  const nombreUsuarioBarbero =
    `${reserva.barbero?.usuario?.nombres ?? ""} ${
      reserva.barbero?.usuario?.apellidos ?? ""
    }`.trim() || "Barbero asignado";
  const nombreBarbero = reserva.barbero?.nombreProfesional ?? nombreUsuarioBarbero;

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {reserva.servicio?.nombre ?? "Servicio de barbería"}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {nombreBarbero}
          </h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            {formatoFecha(reserva.fechaReserva)} · {reserva.horaInicio}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <PagoBadge estado={pago?.estadoPago} />
          <span className={getEstadoBadgeClass(reserva.estadoReserva)}>
            Reserva {reserva.estadoReserva}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Método</p>
          <p className="mt-1 font-black text-white">{reserva.metodoPago ?? pago?.metodoPago ?? "Pendiente"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Total</p>
          <p className="mt-1 font-black text-[#f5d77b]">
            {formatoMoneda(pago?.montoTotal ?? reserva.total)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Pago</p>
          <p className="mt-1 font-black text-white">{pago?.idPago ? "Asociado" : "Consultar por reserva"}</p>
        </div>
      </div>

      <Link
        className="mt-5 inline-flex w-full justify-center rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b]"
        href={`/cliente/pagos/${reserva.idReserva}`}
      >
        Ver pago
      </Link>
    </article>
  );
}
