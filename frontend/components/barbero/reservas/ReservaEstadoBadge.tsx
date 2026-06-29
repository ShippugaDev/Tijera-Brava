import type { EstadoReserva } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

export function ReservaEstadoBadge({ estado }: { estado: EstadoReserva }) {
  return (
    <span className={getEstadoBadgeClass(estado)}>
      {estado.replace(/_/g, " ")}
    </span>
  );
}
