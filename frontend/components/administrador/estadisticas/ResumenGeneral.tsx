import { EstadisticaCard } from "@/components/administrador/estadisticas/EstadisticaCard";
import { FormError } from "@/components/ui/FormMessage";
import type { DashboardAdministracion } from "@/lib/types";

type Props = {
  dashboard: DashboardAdministracion | null;
  error?: string;
};

export function ResumenGeneral({ dashboard, error = "" }: Props) {
  if (error) return <FormError mensaje={error} />;
  if (!dashboard) return <FormError mensaje="No se pudo cargar el resumen general." />;

  const cards = [
    ["Total usuarios", dashboard.usuarios.totalUsuarios, "Cuentas"],
    ["Total clientes", dashboard.usuarios.totalClientes, "Clientes"],
    ["Total barberos", dashboard.usuarios.totalBarberos, "Profesionales"],
    ["Barberos pendientes", dashboard.barberos.pendientes, "Revisión"],
    ["Total reservas", dashboard.reservas.totalReservas, "Histórico"],
    ["Reservas finalizadas", dashboard.reservas.finalizadas, "Cerradas"],
    ["Reservas canceladas", dashboard.reservas.canceladas, "Canceladas"],
    ["Pagos confirmados", dashboard.pagos.confirmados, "Pagos"],
    ["Monto confirmado", `S/ ${dashboard.pagos.montoTotalConfirmado.toFixed(2)}`, "Ingresos"],
    ["Simulaciones LookIA", dashboard.lookia.totalSimulaciones, "Pruebas"],
    ["Notificaciones no leídas", dashboard.notificaciones.noLeidas, "Alertas"]
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Resumen general</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([titulo, valor, detalle]) => (
          <EstadisticaCard detalle={String(detalle)} key={String(titulo)} titulo={String(titulo)} valor={valor} />
        ))}
      </div>
    </section>
  );
}
