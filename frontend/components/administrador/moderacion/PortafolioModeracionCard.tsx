"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { resolverUrlArchivo } from "@/lib/api";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { PortafolioModeracion } from "@/lib/types";

type Props = {
  portafolio: PortafolioModeracion;
  onOcultar: (portafolio: PortafolioModeracion) => void;
  onVisible: (portafolio: PortafolioModeracion) => void;
};

const fecha = (valor?: string) =>
  valor ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(valor)) : "No registrado";

export function PortafolioModeracionCard({ portafolio, onOcultar, onVisible }: Props) {
  const estado = portafolio.estadoVisibilidad ?? "VISIBLE";
  const barbero = portafolio.barbero;
  const usuario = barbero?.usuario;
  const categoria = portafolio.categoriaCorte?.nombre ?? portafolio.categoria?.nombre ?? "Sin categoría";
  const imagenUrl = resolverUrlArchivo(portafolio.imagenUrl);

  return (
    <Card className="border-[#d4af37]/18 bg-[#0d0d0d]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{portafolio.titulo}</h3>
            <Badge className={getEstadoBadgeClass(estado)}>{estado}</Badge>
            {portafolio.destacado ? (
              <Badge className={getEstadoBadgeClass("DESTACADA")}>
                Destacada
              </Badge>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
            {portafolio.descripcion || "Sin descripción registrada."}
          </p>
          <ImagenModeracion imagenUrl={imagenUrl} titulo={portafolio.titulo} />
          <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5] md:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Barbero:</span>{" "}
              {barbero?.nombreProfesional || "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Usuario:</span>{" "}
              {usuario ? `${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim() : "No registrado"}
            </p>
            <p>
              <span className="font-semibold text-white">Categoría:</span> {categoria}
            </p>
            <p>
              <span className="font-semibold text-white">Fecha:</span> {fecha(portafolio.fechaCreacion)}
            </p>
            <p className="md:col-span-2">
              <span className="font-semibold text-white">Imagen:</span>{" "}
              {imagenUrl ? (
                <a className="break-all text-[#f5d77b] hover:underline" href={imagenUrl} rel="noreferrer" target="_blank">
                  {portafolio.imagenUrl}
                </a>
              ) : (
                "No registrada"
              )}
            </p>
          </div>
          {portafolio.motivoModeracion ? (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-100">
              <span className="font-semibold">Motivo:</span> {portafolio.motivoModeracion}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
          <Button
            className="border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-400"
            disabled={estado === "OCULTO" || estado === "ELIMINADO"}
            onClick={() => onOcultar(portafolio)}
            type="button"
            variant="secondary"
          >
            Ocultar
          </Button>
          <Button
            className="border-[#d4af37]/45 bg-[#050505] text-[#f5d77b] hover:border-[#f5d77b]"
            disabled={estado === "VISIBLE" || estado === "ELIMINADO"}
            onClick={() => onVisible(portafolio)}
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

function ImagenModeracion({
  imagenUrl,
  titulo
}: {
  imagenUrl?: string | null;
  titulo: string;
}) {
  const [fallo, setFallo] = useState(false);

  if (!imagenUrl || fallo) {
    return (
      <div className="mt-4 flex h-44 items-center justify-center rounded-lg border border-dashed border-[#d4af37]/25 bg-[#171717] px-5 text-center text-sm text-[#b5b5b5]">
        Vista previa no disponible
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
      <img
        alt={titulo}
        className="h-44 w-full object-cover"
        onError={() => setFallo(true)}
        src={imagenUrl}
      />
    </div>
  );
}
