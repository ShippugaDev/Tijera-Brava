import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormMessage";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { ReservaEstadistica } from "@/lib/types";

type Props = {
  datos?: ReservaEstadistica[];
  error?: string;
};

const estados = [
  "PENDIENTE",
  "CONFIRMADA",
  "EN_CAMINO",
  "EN_SERVICIO",
  "FINALIZADA",
  "CANCELADA_CLIENTE",
  "CANCELADA_BARBERO",
  "CANCELADA_ADMINISTRACION",
  "RECHAZADA"
];

export function ReservasStats({ datos = [], error = "" }: Props) {
  const porEstado = new Map(datos.map((item) => [item.estadoReserva ?? item.periodo ?? "", item.total]));

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Reservas</h2>
      {error ? <FormError mensaje={error} /> : null}
      {!error && datos.length === 0 ? (
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] text-[#b5b5b5]">
          No hay estadísticas de reservas disponibles.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {estados.map((estado) => (
            <Card className="border-white/10 bg-[#0d0d0d]" key={estado}>
              <span className={getEstadoBadgeClass(estado)}>{estado.replace(/_/g, " ")}</span>
              <p className="mt-2 text-3xl font-black text-white">{porEstado.get(estado) ?? 0}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
