import type { ServicioBarberoAsignado } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

type ServicioBarberoCardProps = {
  servicio: ServicioBarberoAsignado;
  onEditar: (servicio: ServicioBarberoAsignado) => void;
  onRetirar: (servicio: ServicioBarberoAsignado) => void;
};

const formatoMoneda = (monto?: number | null) =>
  new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(monto ?? 0);

export function ServicioBarberoCard({ servicio, onEditar, onRetirar }: ServicioBarberoCardProps) {
  const datosServicio = servicio.servicio;
  const estado = servicio.activo === false ? "INACTIVO" : "ACTIVO";

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Servicio ofrecido
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {datosServicio?.nombre ?? "Servicio"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
            {datosServicio?.descripcion ?? "Servicio asignado a tu perfil profesional."}
          </p>
        </div>
        <span className={getEstadoBadgeClass(estado)}>
          {estado}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Dato titulo="Precio" valor={formatoMoneda(servicio.precioFinal ?? servicio.precioPersonalizado)} />
        <Dato
          titulo="Duración"
          valor={`${servicio.duracionFinal ?? servicio.duracionPersonalizada ?? datosServicio?.duracionMinutos ?? 0} min`}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
          onClick={() => onEditar(servicio)}
          type="button"
        >
          Editar
        </button>
        <button
          className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/10"
          onClick={() => onRetirar(servicio)}
          type="button"
        >
          Retirar
        </button>
      </div>
    </article>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
      <p className="text-[#b5b5b5]">{titulo}</p>
      <p className="mt-1 font-black text-[#f5d77b]">{valor}</p>
    </div>
  );
}
