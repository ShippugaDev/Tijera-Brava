import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { ServicioAdmin } from "@/lib/types";

type Props = {
  servicio: ServicioAdmin;
  onEditar: (servicio: ServicioAdmin) => void;
  onDesactivar: (servicio: ServicioAdmin) => void;
};

export function ServicioAdminCard({ servicio, onEditar, onDesactivar }: Props) {
  const estado = servicio.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{servicio.nombre}</h3>
            <Badge className={getEstadoBadgeClass(estado)}>{estado}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
            {servicio.descripcion || "Sin descripción registrada."}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Precio base:</span> S/{" "}
              {Number(servicio.precioBase ?? 0).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold text-white">Duración:</span>{" "}
              {servicio.duracionMinutos ?? servicio.duracionBase ?? 0} min
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
            onClick={() => onEditar(servicio)}
            type="button"
            variant="secondary"
          >
            Editar
          </Button>
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            disabled={servicio.activo === false}
            onClick={() => onDesactivar(servicio)}
            type="button"
            variant="secondary"
          >
            Desactivar
          </Button>
        </div>
      </div>
    </Card>
  );
}
