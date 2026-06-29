import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { CategoriaCorteAdmin } from "@/lib/types";

type Props = {
  categoria: CategoriaCorteAdmin;
  onEditar: (categoria: CategoriaCorteAdmin) => void;
  onDesactivar: (categoria: CategoriaCorteAdmin) => void;
};

const estaActiva = (categoria: CategoriaCorteAdmin) => categoria.activa ?? categoria.activo ?? true;

export function CategoriaAdminCard({ categoria, onEditar, onDesactivar }: Props) {
  const activa = estaActiva(categoria);
  const estado = activa ? "ACTIVA" : "INACTIVA";

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{categoria.nombre}</h3>
            <Badge className={getEstadoBadgeClass(estado)}>{estado}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
            {categoria.descripcion || "Sin descripción registrada."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
            onClick={() => onEditar(categoria)}
            type="button"
            variant="secondary"
          >
            Editar
          </Button>
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            disabled={!activa}
            onClick={() => onDesactivar(categoria)}
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
