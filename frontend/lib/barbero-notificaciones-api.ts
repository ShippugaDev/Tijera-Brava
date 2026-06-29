import { apiFetch } from "@/lib/api";
import type { ApiResponse, Notificacion, Paginacion } from "@/lib/types";

type ListaResponse<T> = ApiResponse<T[]> & { paginacion?: Paginacion };

const queryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export async function listarNotificaciones(filtros: {
  leida?: boolean;
  tipo?: string;
  pagina?: number;
  limite?: number;
}) {
  return apiFetch<ListaResponse<Notificacion>>(`/notificaciones${queryString(filtros)}`);
}

export async function contarNotificacionesNoLeidas() {
  return apiFetch<ApiResponse<{ total: number }>>("/notificaciones/no-leidas/total");
}

export async function marcarNotificacionLeida(idNotificacion: string) {
  return apiFetch<ApiResponse<{ notificacion: Notificacion }>>(
    `/notificaciones/${idNotificacion}/leer`,
    { method: "PATCH" }
  );
}

export async function marcarTodasNotificacionesLeidas() {
  return apiFetch<ApiResponse<{ totalActualizadas: number }>>("/notificaciones/leer-todas", {
    method: "PATCH"
  });
}
