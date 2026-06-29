import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { UsuarioAdmin } from "@/lib/types";

type BarberoUsuario = UsuarioAdmin & {
  barbero?: {
    idBarbero?: string;
    nombreProfesional?: string | null;
    anosExperiencia?: number;
    aniosExperiencia?: number;
    estadoAprobacion?: string;
  } | null;
};

type BarberoAdminCardProps = {
  usuario: BarberoUsuario;
  onCambiarEstado?: (usuario: BarberoUsuario) => void;
};

export function BarberoAdminCard({ usuario, onCambiarEstado }: BarberoAdminCardProps) {
  const perfil = usuario.barbero;
  const puedeCambiarEstado = Boolean(perfil?.idBarbero);

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">
              {usuario.nombres} {usuario.apellidos ?? ""}
            </h3>
            <Badge className={getEstadoBadgeClass(perfil?.estadoAprobacion)}>
              {perfil?.estadoAprobacion ?? "No registrado"}
            </Badge>
            <Badge className={getEstadoBadgeClass(usuario.estadoCuenta)}>
              {usuario.estadoCuenta ?? "PENDIENTE"}
            </Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[#b5b5b5] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Correo:</span> {usuario.correo}
            </p>
            <p>
              <span className="font-semibold text-white">Teléfono:</span>{" "}
              {usuario.telefono || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Nombre profesional:</span>{" "}
              {perfil?.nombreProfesional || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Experiencia:</span>{" "}
              {perfil?.anosExperiencia ?? perfil?.aniosExperiencia ?? "No registrado"}
            </p>
          </div>
        </div>
        <Button
          className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
          disabled={!puedeCambiarEstado}
          onClick={() => onCambiarEstado?.(usuario)}
          type="button"
          variant="secondary"
        >
          Cambiar estado
        </Button>
      </div>
    </Card>
  );
}
