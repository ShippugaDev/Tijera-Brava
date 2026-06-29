import type { HistorialPago as HistorialPagoItem } from "@/lib/types";
import { getEstadoBadgeClass } from "@/lib/status-styles";

const formatoFecha = (fecha?: string) => {
  if (!fecha) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
};

export function HistorialPago({ historial }: { historial: HistorialPagoItem[] }) {
  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <h2 className="text-xl font-black text-white">Historial del pago</h2>
      {historial.length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-[#171717] p-5 text-center text-sm text-[#b5b5b5]">
          Aún no hay historial disponible para este pago.
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {historial.map((item) => (
            <article
              className="rounded-lg border border-white/10 bg-[#171717] p-4"
              key={item.idHistorialEstadoPago ?? item.idHistorialPago ?? `${item.estadoNuevo}-${item.fechaCreacion}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex flex-wrap items-center gap-2 font-black text-white">
                  {item.estadoAnterior ? (
                    <span className={getEstadoBadgeClass(item.estadoAnterior)}>
                      {item.estadoAnterior.replace(/_/g, " ")}
                    </span>
                  ) : (
                    <span>Inicio</span>
                  )}
                  <span className="text-[#b5b5b5]">→</span>
                  <span className={getEstadoBadgeClass(item.estadoNuevo)}>
                    {item.estadoNuevo.replace(/_/g, " ")}
                  </span>
                </p>
                <span className="text-xs font-semibold text-[#b5b5b5]">
                  {formatoFecha(item.fechaCreacion)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
                {item.observacion ?? item.comentario ?? "Sin observación registrada."}
              </p>
              {item.usuarioResponsable ? (
                <p className="mt-2 text-xs text-[#f5d77b]">
                  Responsable:{" "}
                  {`${item.usuarioResponsable.nombres ?? ""} ${
                    item.usuarioResponsable.apellidos ?? ""
                  }`.trim() || item.usuarioResponsable.correo || "Usuario"}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
