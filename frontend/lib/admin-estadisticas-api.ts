import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  BarberoEstadistica,
  DashboardAdministracion,
  LookIAEstadistica,
  PagosEstadistica,
  ReservaEstadistica,
  ServicioEstadistica
} from "@/lib/types";

export type FiltrosEstadisticas = {
  desde?: string;
  hasta?: string;
};

const construirQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

export const obtenerDashboardAdminStats = () =>
  apiFetch<ApiResponse<DashboardAdministracion>>("/administracion/dashboard");

export const obtenerReservasStats = (filtros: FiltrosEstadisticas) =>
  apiFetch<ApiResponse<{ agrupadoPor: string; resultados: ReservaEstadistica[] }>>(
    `/administracion/estadisticas/reservas${construirQuery({
      ...filtros,
      agruparPor: "estado"
    })}`
  );

export const obtenerServiciosStats = (filtros: FiltrosEstadisticas) =>
  apiFetch<ApiResponse<ServicioEstadistica[]>>(
    `/administracion/estadisticas/servicios${construirQuery({ ...filtros, limite: 10 })}`
  );

export const obtenerBarberosStats = (filtros: FiltrosEstadisticas) =>
  apiFetch<ApiResponse<BarberoEstadistica[]>>(
    `/administracion/estadisticas/barberos${construirQuery({
      ...filtros,
      limite: 10,
      ordenarPor: "reservas"
    })}`
  );

export const obtenerLookIAStats = (filtros: FiltrosEstadisticas) =>
  apiFetch<ApiResponse<LookIAEstadistica>>(
    `/administracion/estadisticas/lookia${construirQuery({
      ...filtros,
      agruparPor: "estado"
    })}`
  );

export const obtenerPagosStats = (filtros: FiltrosEstadisticas) =>
  apiFetch<ApiResponse<PagosEstadistica>>(
    `/administracion/estadisticas/pagos${construirQuery({
      ...filtros,
      agruparPor: "estado"
    })}`
  );
