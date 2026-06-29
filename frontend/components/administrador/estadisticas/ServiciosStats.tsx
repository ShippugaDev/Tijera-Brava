import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import type { ServicioEstadistica } from "@/lib/types";

type Props = {
  datos?: ServicioEstadistica[];
  error?: string;
};

export function ServiciosStats({ datos = [], error = "" }: Props) {
  const maximo = Math.max(...datos.map((item) => item.totalReservas ?? 0), 1);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Servicios más solicitados</h2>
      {error ? <FormError mensaje={error} /> : null}
      {!error && datos.length === 0 ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          Estadística no disponible por ahora.
        </Card>
      ) : (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
          <div className="space-y-4">
            {datos.map((servicio) => {
              const total = servicio.totalReservas ?? 0;
              const width = `${Math.max((total / maximo) * 100, 6)}%`;
              return (
                <div key={servicio.idServicio ?? servicio.nombre}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-white">{servicio.nombre}</span>
                    <span className="text-[#b5b5b5]">{total} reservas</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-[#d4af37]" style={{ width }} />
                  </div>
                  <p className="mt-1 text-xs text-[#b5b5b5]">
                    Ingreso generado: S/ {Number(servicio.montoGenerado ?? servicio.totalIngresos ?? 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </section>
  );
}
