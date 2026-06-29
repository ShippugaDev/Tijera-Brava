import { EstadisticaCard } from "@/components/administrador/estadisticas/EstadisticaCard";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { LookIAEstadistica } from "@/lib/types";

type Props = {
  datos?: LookIAEstadistica | null;
  error?: string;
};

export function LookIAStats({ datos, error = "" }: Props) {
  const resumen = datos?.resumen;
  const resultados = datos?.resultados ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">LookIA</h2>
      {error ? <FormError mensaje={error} /> : null}
      {!error && !datos ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          Estadística no disponible por ahora.
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <EstadisticaCard detalle="Simulaciones" titulo="Total" valor={resumen?.totalSimulaciones ?? 0} />
            <EstadisticaCard detalle="Completadas" titulo="Completadas" valor={resumen?.completadas ?? 0} />
            <EstadisticaCard detalle="Fallidas" titulo="Fallidas" valor={resumen?.fallidas ?? 0} />
          </div>
          <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d4af37]">
              Uso por estado
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {resultados.map((item) => (
                <div className="rounded-lg border border-white/10 bg-[#050505] p-4" key={item.estadoSimulacion ?? item.periodo ?? item.estilo?.nombre}>
                  <span className={getEstadoBadgeClass(item.estadoSimulacion ?? item.estilo?.nombre ?? item.categoria?.nombre ?? item.periodo)}>
                    {item.estadoSimulacion ?? item.estilo?.nombre ?? item.categoria?.nombre ?? item.periodo ?? "Sin grupo"}
                  </span>
                  <p className="mt-2 text-2xl font-black text-[#f5d77b]">{item.total}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#b5b5b5]">
              La conversión LookIA → reserva se habilitará cuando haya más datos registrados.
            </p>
          </Card>
        </>
      )}
    </section>
  );
}
