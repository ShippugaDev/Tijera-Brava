import type { EstadoPago } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

export function PagoBadge({ estado }: { estado?: EstadoPago }) {
  const valor = estado ?? "PENDIENTE";

  return (
    <span className={getEstadoBadgeClass(valor)}>
      {valor.replace(/_/g, " ")}
    </span>
  );
}
