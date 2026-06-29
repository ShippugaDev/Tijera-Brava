import type { RolUsuario } from "@/lib/types";
import { getRolBadgeClass } from "@/lib/status-styles";

const labels: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  BARBERO: "Barbero",
  CLIENTE: "Cliente"
};

export function RoleBadge({ rol }: { rol: RolUsuario }) {
  return (
    <span className={getRolBadgeClass()}>
      {labels[rol]}
    </span>
  );
}
