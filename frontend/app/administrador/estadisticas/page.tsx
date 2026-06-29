"use client";

import { useCallback, useEffect, useState } from "react";
import { BarberosStats } from "@/components/administrador/estadisticas/BarberosStats";
import { FiltrosFecha } from "@/components/administrador/estadisticas/FiltrosFecha";
import { LookIAStats } from "@/components/administrador/estadisticas/LookIAStats";
import { PagosStats } from "@/components/administrador/estadisticas/PagosStats";
import { ReservasStats } from "@/components/administrador/estadisticas/ReservasStats";
import { ResumenGeneral } from "@/components/administrador/estadisticas/ResumenGeneral";
import { ServiciosStats } from "@/components/administrador/estadisticas/ServiciosStats";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { adminSidebarItems } from "@/lib/admin-navigation";
import {
  obtenerBarberosStats,
  obtenerDashboardAdminStats,
  obtenerLookIAStats,
  obtenerPagosStats,
  obtenerReservasStats,
  obtenerServiciosStats,
  type FiltrosEstadisticas
} from "@/lib/admin-estadisticas-api";
import type {
  BarberoEstadistica,
  DashboardAdministracion,
  LookIAEstadistica,
  PagosEstadistica,
  ReservaEstadistica,
  ServicioEstadistica
} from "@/lib/types";

type ErroresStats = {
  dashboard?: string;
  reservas?: string;
  servicios?: string;
  barberos?: string;
  lookia?: string;
  pagos?: string;
};

function EstadisticasAdmin() {
  const [filtros, setFiltros] = useState<FiltrosEstadisticas>({});
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState<ErroresStats>({});
  const [dashboard, setDashboard] = useState<DashboardAdministracion | null>(null);
  const [reservas, setReservas] = useState<ReservaEstadistica[]>([]);
  const [servicios, setServicios] = useState<ServicioEstadistica[]>([]);
  const [barberos, setBarberos] = useState<BarberoEstadistica[]>([]);
  const [lookia, setLookia] = useState<LookIAEstadistica | null>(null);
  const [pagos, setPagos] = useState<PagosEstadistica | null>(null);

  const cargarEstadisticas = useCallback(async (filtrosActuales: FiltrosEstadisticas) => {
    setCargando(true);
    const nuevosErrores: ErroresStats = {};

    const [
      dashboardResponse,
      reservasResponse,
      serviciosResponse,
      barberosResponse,
      lookiaResponse,
      pagosResponse
    ] = await Promise.allSettled([
      obtenerDashboardAdminStats(),
      obtenerReservasStats(filtrosActuales),
      obtenerServiciosStats(filtrosActuales),
      obtenerBarberosStats(filtrosActuales),
      obtenerLookIAStats(filtrosActuales),
      obtenerPagosStats(filtrosActuales)
    ]);

    if (dashboardResponse.status === "fulfilled") {
      setDashboard(dashboardResponse.value.datos);
    } else {
      nuevosErrores.dashboard = "No se pudo cargar el resumen general.";
    }

    if (reservasResponse.status === "fulfilled") {
      setReservas(reservasResponse.value.datos.resultados);
    } else {
      nuevosErrores.reservas = "No se pudieron cargar las estadísticas de reservas.";
    }

    if (serviciosResponse.status === "fulfilled") {
      setServicios(serviciosResponse.value.datos);
    } else {
      nuevosErrores.servicios = "No se pudieron cargar las estadísticas de servicios.";
    }

    if (barberosResponse.status === "fulfilled") {
      setBarberos(barberosResponse.value.datos);
    } else {
      nuevosErrores.barberos = "No se pudieron cargar las estadísticas de barberos.";
    }

    if (lookiaResponse.status === "fulfilled") {
      setLookia(lookiaResponse.value.datos);
    } else {
      nuevosErrores.lookia = "No se pudieron cargar las estadísticas de LookIA.";
    }

    if (pagosResponse.status === "fulfilled") {
      setPagos(pagosResponse.value.datos);
    } else {
      nuevosErrores.pagos = "No se pudieron cargar las estadísticas de pagos.";
    }

    setErrores(nuevosErrores);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarEstadisticas(filtros);
  }, [cargarEstadisticas, filtros]);

  const aplicarFiltros = (nuevosFiltros: FiltrosEstadisticas) => {
    setFiltros(nuevosFiltros);
  };

  return (
    <div className="space-y-7">
      <Card className="border-[#d4af37]/20 bg-[#0d0d0d]">
        <p className="text-sm leading-6 text-[#b5b5b5]">
          Estos indicadores ayudan al administrador a revisar el rendimiento operativo de Tijera
          Brava.
        </p>
      </Card>

      <FiltrosFecha filtros={filtros} onAplicar={aplicarFiltros} />

      {cargando ? (
        <Loading texto="Cargando estadísticas..." />
      ) : (
        <>
          <ResumenGeneral dashboard={dashboard} error={errores.dashboard} />
          <ReservasStats datos={reservas} error={errores.reservas} />
          <ServiciosStats datos={servicios} error={errores.servicios} />
          <BarberosStats datos={barberos} error={errores.barberos} />
          <LookIAStats datos={lookia} error={errores.lookia} />
          <PagosStats dashboard={dashboard} datos={pagos} error={errores.pagos} />
        </>
      )}
    </div>
  );
}

export default function AdministradorEstadisticasPage() {
  return (
    <ProtectedRoute rolPermitido="ADMINISTRADOR">
      {(usuario) => (
        <RoleLayout
          descripcion="Analiza la actividad general de reservas, pagos, servicios, barberos y LookIA."
          sidebarItems={adminSidebarItems}
          titulo="Estadísticas"
          usuario={usuario}
        >
          <EstadisticasAdmin />
        </RoleLayout>
      )}
    </ProtectedRoute>
  );
}
