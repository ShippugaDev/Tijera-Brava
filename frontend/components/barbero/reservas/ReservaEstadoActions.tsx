"use client";

import type { EstadoReserva } from "@/lib/types";

export type AccionReservaBarbero =
  | "aceptar"
  | "rechazar"
  | "en-camino"
  | "iniciar"
  | "finalizar"
  | "cancelar";

type ReservaEstadoActionsProps = {
  estado: EstadoReserva;
  disabled?: boolean;
  onAction: (accion: AccionReservaBarbero) => void;
};

const accionClass =
  "rounded-lg px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60";
const primaryClass = `${accionClass} bg-[#d4af37] text-black hover:bg-[#f5d77b]`;
const secondaryClass = `${accionClass} border border-[#d4af37]/40 text-[#f5d77b] hover:bg-[#d4af37]/10`;
const dangerClass = `${accionClass} border border-red-500/30 text-red-200 hover:bg-red-500/10`;

export function ReservaEstadoActions({ estado, disabled = false, onAction }: ReservaEstadoActionsProps) {
  const puedeCancelar = ["CONFIRMADA", "EN_CAMINO", "EN_SERVICIO"].includes(estado);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {estado === "PENDIENTE" ? (
        <>
          <button className={primaryClass} disabled={disabled} onClick={() => onAction("aceptar")} type="button">
            Aceptar
          </button>
          <button className={dangerClass} disabled={disabled} onClick={() => onAction("rechazar")} type="button">
            Rechazar
          </button>
        </>
      ) : null}
      {estado === "CONFIRMADA" ? (
        <button className={primaryClass} disabled={disabled} onClick={() => onAction("en-camino")} type="button">
          Marcar en camino
        </button>
      ) : null}
      {estado === "EN_CAMINO" ? (
        <button className={primaryClass} disabled={disabled} onClick={() => onAction("iniciar")} type="button">
          Iniciar servicio
        </button>
      ) : null}
      {estado === "EN_SERVICIO" ? (
        <button className={primaryClass} disabled={disabled} onClick={() => onAction("finalizar")} type="button">
          Finalizar servicio
        </button>
      ) : null}
      {puedeCancelar ? (
        <button className={secondaryClass} disabled={disabled} onClick={() => onAction("cancelar")} type="button">
          Cancelar reserva
        </button>
      ) : null}
    </div>
  );
}
