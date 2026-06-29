import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { BarberoPendienteAdmin } from "@/lib/types";

type BarberoPendienteCardProps = {
  barbero: BarberoPendienteAdmin;
  onAprobar: (barbero: BarberoPendienteAdmin) => void;
  onRechazar: (barbero: BarberoPendienteAdmin) => void;
};

const formatearFecha = (fecha?: string) =>
  fecha ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha)) : "No registrado";

export function BarberoPendienteCard({ barbero, onAprobar, onRechazar }: BarberoPendienteCardProps) {
  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">
              {barbero.nombreProfesional || `${barbero.nombres} ${barbero.apellidos ?? ""}`}
            </h3>
            <Badge className={getEstadoBadgeClass(barbero.estadoAprobacion ?? "PENDIENTE")}>
              {barbero.estadoAprobacion ?? "PENDIENTE"}
            </Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[#b5b5b5] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Solicitante:</span> {barbero.nombres}{" "}
              {barbero.apellidos ?? ""}
            </p>
            <p>
              <span className="font-semibold text-white">Correo:</span> {barbero.correo}
            </p>
            <p>
              <span className="font-semibold text-white">Teléfono:</span>{" "}
              {barbero.telefono || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Experiencia:</span>{" "}
              {barbero.anosExperiencia ?? barbero.aniosExperiencia ?? "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Solicitud:</span>{" "}
              {formatearFecha(barbero.fechaCreacion)}
            </p>
            <p>
              <span className="font-semibold text-white">Especialidades:</span>{" "}
              {barbero.especialidades?.length ? barbero.especialidades.join(", ") : "No registrado"}
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#b5b5b5]">
            {barbero.biografia || "Sin biografía registrada."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            className="bg-[#d4af37] text-black hover:bg-[#f5d77b]"
            onClick={() => onAprobar(barbero)}
            type="button"
          >
            Aprobar
          </Button>
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            onClick={() => onRechazar(barbero)}
            type="button"
            variant="secondary"
          >
            Rechazar
          </Button>
        </div>
      </div>
    </Card>
  );
}
