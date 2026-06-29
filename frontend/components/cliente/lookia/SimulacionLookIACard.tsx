import Link from "next/link";
import { useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { SimulacionLookIA } from "@/lib/types";

type SimulacionLookIACardProps = {
  simulacion: SimulacionLookIA;
  onEliminar: (idSimulacionLookIA: string) => void;
};

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

export function SimulacionLookIACard({ simulacion, onEliminar }: SimulacionLookIACardProps) {
  const imagenGenerada = simulacion.imagenGeneradaUrl ?? simulacion.imagenResultadoUrl;
  const puedeEliminar = simulacion.estadoSimulacion !== "ELIMINADA";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <span className={getEstadoBadgeClass(simulacion.estadoSimulacion)}>
            {simulacion.estadoSimulacion}
          </span>
          <h3 className="mt-3 text-xl font-black text-white">
            {simulacion.estilo?.nombre ?? "Simulación LookIA"}
          </h3>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            Creada el {formatoFecha(simulacion.fechaCreacion)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-center text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
            href={`/cliente/lookia/${simulacion.idSimulacionLookIA}`}
          >
            Ver detalle
          </Link>
          {puedeEliminar ? (
            <button
              className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10"
              onClick={() => onEliminar(simulacion.idSimulacionLookIA)}
              type="button"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ImagenSimulacion titulo="Imagen original" url={simulacion.imagenOriginalUrl} />
        <ImagenSimulacion titulo="Imagen generada" url={imagenGenerada} />
      </div>
    </article>
  );
}

function ImagenSimulacion({ titulo, url }: { titulo: string; url?: string | null }) {
  const [fallo, setFallo] = useState(false);
  const urlResuelta = resolverUrlArchivo(url);

  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b5b5b5]">
        {titulo}
      </p>
      {urlResuelta && !fallo ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
          <img
            alt={titulo}
            className="h-40 w-full object-cover"
            onError={() => setFallo(true)}
            src={urlResuelta}
          />
        </div>
      ) : (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/30 px-4 text-center text-sm text-[#b5b5b5]">
          Vista previa no disponible
        </div>
      )}
    </div>
  );
}
