import type { ServicioCatalogo } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type ServicioCatalogoCardProps = {
  servicio: ServicioCatalogo;
  asignado: boolean;
  onAsignar: (servicio: ServicioCatalogo) => void;
};

const formatoMoneda = (monto?: number) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

export function ServicioCatalogoCard({ servicio, asignado, onAsignar }: ServicioCatalogoCardProps) {
  const duracion = servicio.duracionMinutos ?? servicio.duracionBase ?? 0;
  const estado = servicio.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Catálogo
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{servicio.nombre}</h3>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#b5b5b5]">
        {servicio.descripcion ?? "Servicio disponible para asignar a tu perfil."}
      </p>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Dato titulo="Precio base" valor={formatoMoneda(servicio.precioBase)} />
        <Dato titulo="Duración base" valor={`${duracion} min`} />
      </div>

      <button
        className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-black transition ${
          asignado
            ? "cursor-not-allowed border border-white/10 bg-white/5 text-[#b5b5b5]"
            : "bg-[#d4af37] text-black hover:bg-[#f5d77b]"
        }`}
        disabled={asignado || servicio.activo === false}
        onClick={() => onAsignar(servicio)}
        type="button"
      >
        {asignado ? "Ya asignado" : "Agregar a mis servicios"}
      </button>
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
