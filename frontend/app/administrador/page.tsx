"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { MetricCard } from "@/components/ui/MetricCard";
import { SummaryCard } from "@/components/ui/DashboardCard";
import { adminSidebarItems } from "@/lib/admin-navigation";
import { apiFetch } from "@/lib/api";
import type { ApiResponse, DashboardAdministracion } from "@/lib/types";

function DashboardAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdministracion | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiResponse<DashboardAdministracion>>("/administracion/dashboard")
      .then((response) => setDashboard(response.datos))
      .catch(() => setError("No se pudo cargar el dashboard administrativo."));
  }, []);

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-950/20">
        <p className="font-semibold text-red-100">{error}</p>
      </Card>
    );
  }

  if (!dashboard) return <Loading texto="Cargando métricas..." />;

  const metricas = [
    ["Total usuarios", dashboard.usuarios.totalUsuarios, "Cuentas registradas"],
    ["Clientes", dashboard.usuarios.totalClientes, "Perfiles cliente"],
    ["Barberos", dashboard.usuarios.totalBarberos, "Profesionales"],
    ["Barberos pendientes", dashboard.barberos.pendientes, "Por revisar"],
    ["Total reservas", dashboard.reservas.totalReservas, "Reservas históricas"],
    ["Reservas finalizadas", dashboard.reservas.finalizadas, "Servicios cerrados"],
    ["Pagos confirmados", dashboard.pagos.confirmados, "Transacciones"],
    ["Monto confirmado", `S/ ${dashboard.pagos.montoTotalConfirmado.toFixed(2)}`, "Ingresos"],
    ["Simulaciones LookIA", dashboard.lookia.totalSimulaciones, "Pruebas de estilo"],
    ["Notificaciones no leídas", dashboard.notificaciones.noLeidas, "Alertas activas"]
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricas.map(([titulo, valor, detalle]) => (
          <MetricCard detalle={String(detalle)} key={titulo} titulo={String(titulo)} valor={valor} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] xl:col-span-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Resumen de reservas
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              detalle="Pendientes"
              titulo="Por atender"
              valor={dashboard.reservas.pendientes}
            />
            <SummaryCard
              detalle="Confirmadas"
              titulo="En agenda"
              valor={dashboard.reservas.confirmadas}
            />
            <SummaryCard
              detalle="Finalizadas"
              titulo="Cerradas"
              valor={dashboard.reservas.finalizadas}
            />
          </div>
        </Card>

        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] xl:col-span-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Resumen de pagos
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard detalle="Pendientes" titulo="Pagos" valor={dashboard.pagos.pendientes} />
            <SummaryCard detalle="Confirmados" titulo="Pagos" valor={dashboard.pagos.confirmados} />
            <SummaryCard
              detalle="Reembolsados"
              titulo="Pagos"
              valor={dashboard.pagos.reembolsados}
            />
          </div>
        </Card>

        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] xl:col-span-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Estado de barberos
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard detalle="Aprobados" titulo="Activos" valor={dashboard.barberos.aprobados} />
            <SummaryCard detalle="Pendientes" titulo="Revisión" valor={dashboard.barberos.pendientes} />
            <SummaryCard detalle="Rechazados" titulo="Histórico" valor={dashboard.barberos.rechazados} />
          </div>
        </Card>

        <Card className="border-[#d4af37]/20 bg-[#0d0d0d] xl:col-span-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
            Actividad del sistema
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryCard
              detalle="LookIA"
              titulo="Completadas"
              valor={dashboard.lookia.completadas}
            />
            <SummaryCard
              detalle="Notificaciones"
              titulo="No leídas"
              valor={dashboard.notificaciones.noLeidas}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdministradorPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Supervisa usuarios, barberos, reservas, pagos y actividad general del sistema."
          sidebarItems={adminSidebarItems}
          titulo="Panel administrativo"
          usuario={usuario}
        >
          <DashboardAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
