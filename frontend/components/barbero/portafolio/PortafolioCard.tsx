import { PortafolioPreview } from "@/components/barbero/portafolio/PortafolioPreview";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { PortafolioCorte } from "@/lib/types";

type PortafolioCardProps = {
  publicacion: PortafolioCorte;
  onEditar: (publicacion: PortafolioCorte) => void;
  onEliminar: (publicacion: PortafolioCorte) => void;
};

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(fecha));
};

export function PortafolioCard({ publicacion, onEditar, onEliminar }: PortafolioCardProps) {
  const estado = publicacion.estadoVisibilidad ?? "VISIBLE";
  const eliminado = estado === "ELIMINADO";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <PortafolioPreview imagenUrl={publicacion.imagenUrl} titulo={publicacion.titulo} />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            {publicacion.categoria?.nombre ?? "Sin categoría"}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{publicacion.titulo}</h3>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
        {publicacion.descripcion ?? "Sin descripción."}
      </p>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Dato titulo="Destacado" valor={publicacion.destacado ? "Sí" : "No"} />
        <Dato titulo="Fecha" valor={formatoFecha(publicacion.fechaCreacion)} />
      </div>
      {publicacion.imagenUrl ? (
        <p className="mt-3 truncate text-xs text-[#b5b5b5]">{publicacion.imagenUrl}</p>
      ) : null}
      {estado === "OCULTO" ? (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
          Esta publicación fue ocultada por administración.
          {publicacion.motivoModeracion ? (
            <span className="block mt-1">Motivo: {publicacion.motivoModeracion}</span>
          ) : null}
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={eliminado}
          onClick={() => onEditar(publicacion)}
          type="button"
        >
          Editar
        </button>
        <button
          className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={eliminado}
          onClick={() => onEliminar(publicacion)}
          type="button"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
      <p className="text-[#b5b5b5]">{titulo}</p>
      <p className="mt-1 font-black text-white">{valor}</p>
    </div>
  );
}
