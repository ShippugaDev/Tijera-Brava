import { EstadisticaCard } from "@/components/administrador/estadisticas/EstadisticaCard";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { DashboardAdministracion, PagosEstadistica } from "@/lib/types";

type Props = {
  dashboard: DashboardAdministracion | null;
  datos?: PagosEstadistica | null;
  error?: string;
};

export function PagosStats({ dashboard, datos, error = "" }: Props) {
  const pagos = dashboard?.pagos;
  const resultados = datos?.resultados ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Pagos</h2>
      {error ? <FormError mensaje={error} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EstadisticaCard detalle="Pendientes" titulo="Pagos pendientes" valor={pagos?.pendientes ?? 0} />
        <EstadisticaCard detalle="Comprobantes" titulo="Comprobantes subidos" valor={pagos?.comprobantesSubidos ?? 0} />
        <EstadisticaCard detalle="Confirmados" titulo="Pagos confirmados" valor={pagos?.confirmados ?? 0} />
        <EstadisticaCard detalle="Cancelados" titulo="Pagos cancelados" valor={pagos?.cancelados ?? 0} />
        <EstadisticaCard detalle="Reembolsos" titulo="Pagos reembolsados" valor={pagos?.reembolsados ?? 0} />
        <EstadisticaCard
          detalle="Monto confirmado"
          titulo="Monto confirmado"
          valor={`S/ ${Number(pagos?.montoTotalConfirmado ?? 0).toFixed(2)}`}
        />
      </div>
      {resultados.length ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d4af37]">
            Agrupación por estado
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {resultados.map((item) => (
              <div className="rounded-lg border border-white/10 bg-[#050505] p-4" key={item.estadoPago ?? item.metodoPago ?? item.periodo}>
                <span className={getEstadoBadgeClass(item.estadoPago ?? item.metodoPago ?? item.periodo)}>
                  {item.estadoPago ?? item.metodoPago ?? item.periodo}
                </span>
                <p className="mt-2 text-2xl font-black text-[#f5d77b]">{item.total}</p>
                <p className="text-sm text-[#b5b5b5]">S/ {Number(item.montoTotal ?? 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
