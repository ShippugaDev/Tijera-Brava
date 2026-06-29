import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { CalificacionModeracion } from "@/lib/types";

type Props = {
  calificacion: CalificacionModeracion;
  onOcultar: (calificacion: CalificacionModeracion) => void;
  onVisible: (calificacion: CalificacionModeracion) => void;
};

const fecha = (valor?: string) =>
  valor ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(valor)) : "No registrado";

const nombreUsuario = (usuario?: { nombres?: string; apellidos?: string; correo?: string }) => {
  const nombre = `${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`.trim();
  return nombre || usuario?.correo || "No registrado";
};

export function CalificacionModeracionCard({ calificacion, onOcultar, onVisible }: Props) {
  const estado = calificacion.estadoVisibilidad ?? "VISIBLE";
  const cliente = nombreUsuario(calificacion.cliente?.usuario);
  const barbero =
    calificacion.barbero?.nombreProfesional || nombreUsuario(calificacion.barbero?.usuario);

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{calificacion.puntuacion}/5 estrellas</h3>
            <Badge className={getEstadoBadgeClass(estado)}>
              {estado === "OCULTA" ? "OCULTA" : estado}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
            {calificacion.comentario || "Sin comentario registrado."}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5] md:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Cliente:</span> {cliente}
            </p>
            <p>
              <span className="font-semibold text-white">Barbero:</span> {barbero}
            </p>
            <p>
              <span className="font-semibold text-white">Servicio:</span>{" "}
              {calificacion.reserva?.servicio?.nombre || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Fecha:</span> {fecha(calificacion.fechaCreacion)}
            </p>
          </div>
          {calificacion.motivoModeracion ? (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-100">
              <span className="font-semibold">Motivo:</span> {calificacion.motivoModeracion}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            disabled={estado === "OCULTA"}
            onClick={() => onOcultar(calificacion)}
            type="button"
            variant="secondary"
          >
            Ocultar
          </Button>
          <Button
            className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
            disabled={estado === "VISIBLE"}
            onClick={() => onVisible(calificacion)}
            type="button"
            variant="secondary"
          >
            Hacer visible
          </Button>
        </div>
      </div>
    </Card>
  );
}
