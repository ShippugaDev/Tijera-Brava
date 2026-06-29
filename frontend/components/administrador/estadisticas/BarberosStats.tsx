import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { BarberoEstadistica } from "@/lib/types";

type Props = {
  datos?: BarberoEstadistica[];
  error?: string;
};

export function BarberosStats({ datos = [], error = "" }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Barberos destacados</h2>
      {error ? <FormError mensaje={error} /> : null}
      {!error && datos.length === 0 ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          Estadística no disponible por ahora.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {datos.map((barbero) => (
            <Card className="border-[#d4af37]/18 bg-[#0d0d0d]" key={barbero.idBarbero ?? barbero.nombreProfesional}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-black text-white">{barbero.nombreProfesional}</h3>
                <Badge className={getEstadoBadgeClass(barbero.estadoAprobacion ?? barbero.estado)}>
                  {barbero.estadoAprobacion ?? barbero.estado ?? "Sin estado"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-[#b5b5b5] sm:grid-cols-3">
                <p>
                  <span className="block font-semibold text-white">{barbero.totalReservas ?? 0}</span>
                  Reservas
                </p>
                <p>
                  <span className="block font-semibold text-white">
                    {Number(barbero.promedioCalificacion ?? barbero.calificacionPromedio ?? 0).toFixed(1)}
                  </span>
                  Calificación
                </p>
                <p>
                  <span className="block font-semibold text-white">
                    S/ {Number(barbero.montoGenerado ?? 0).toFixed(2)}
                  </span>
                  Ingresos
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
