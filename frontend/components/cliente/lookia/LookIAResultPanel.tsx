import type { SimulacionLookIA } from "@/lib/types";
import { useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";
import { getEstadoBadgeClass } from "@/lib/status-styles";

const formatoFecha = (fecha?: string | null) => {
  if (!fecha) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
};

function ImageSlot({ titulo, url }: { titulo: string; url?: string | null }) {
  const [fallo, setFallo] = useState(false);
  const urlResuelta = resolverUrlArchivo(url);

  return (
    <div className="rounded-xl border border-white/10 bg-[#171717] p-4">
      <p className="text-sm font-black text-white">{titulo}</p>
      {urlResuelta && !fallo ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
          <img
            alt={titulo}
            className="h-56 w-full object-cover"
            onError={() => setFallo(true)}
            src={urlResuelta}
          />
          <p className="break-all px-3 py-2 text-xs text-[#b5b5b5]">{url}</p>
        </div>
      ) : (
        <div className="mt-3 flex h-56 items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/30 px-5 text-center text-sm text-[#b5b5b5]">
          {url ? "Vista previa no disponible." : "Aún no hay URL disponible."}
        </div>
      )}
    </div>
  );
}

export function LookIAResultPanel({ simulacion }: { simulacion: SimulacionLookIA }) {
  const imagenGenerada = simulacion.imagenGeneradaUrl ?? simulacion.imagenResultadoUrl;

  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Resultado LookIA
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {simulacion.estilo?.nombre ?? "Estilo seleccionado"}
          </h2>
          <p className="mt-2 text-sm text-[#b5b5b5]">
            Creada el {formatoFecha(simulacion.fechaCreacion)}
          </p>
        </div>
        <span className={getEstadoBadgeClass(simulacion.estadoSimulacion)}>
          {simulacion.estadoSimulacion}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ImageSlot titulo="Imagen original" url={simulacion.imagenOriginalUrl} />
        <ImageSlot titulo="Imagen generada" url={imagenGenerada} />
      </div>

      {simulacion.resultadoTexto || simulacion.mensajeError ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-[#171717] p-4">
          <p className="text-sm font-black text-white">Detalle</p>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
            {simulacion.resultadoTexto ?? simulacion.mensajeError}
          </p>
        </div>
      ) : null}
    </section>
  );
}
