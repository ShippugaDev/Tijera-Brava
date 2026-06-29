import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { ZonaCoberturaAdmin } from "@/lib/types";

type Props = {
  zona: ZonaCoberturaAdmin;
  onEditar: (zona: ZonaCoberturaAdmin) => void;
  onDesactivar: (zona: ZonaCoberturaAdmin) => void;
};

const estaActiva = (zona: ZonaCoberturaAdmin) => zona.activa ?? zona.activo ?? true;

export function ZonaAdminCard({ zona, onEditar, onDesactivar }: Props) {
  const activa = estaActiva(zona);
  const estado = activa ? "ACTIVA" : "INACTIVA";

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{zona.nombre}</h3>
            <Badge className={getEstadoBadgeClass(estado)}>{estado}</Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[#b5b5b5] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Distrito:</span>{" "}
              {zona.distrito || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Provincia:</span>{" "}
              {zona.provincia || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Departamento:</span>{" "}
              {zona.departamento || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Costo traslado:</span>{" "}
              {zona.costoTraslado != null ? `S/ ${Number(zona.costoTraslado).toFixed(2)}` : "No aplica"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
            onClick={() => onEditar(zona)}
            type="button"
            variant="secondary"
          >
            Editar
          </Button>
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            disabled={!activa}
            onClick={() => onDesactivar(zona)}
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
