import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CalificacionCliente,
  NuevaCalificacionPayload,
  Paginacion
} from "@/lib/types";

type ListaResponse<T> = ApiResponse<T[]> & { paginacion?: Paginacion };

const queryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export async function listarMisCalificaciones(filtros: { pagina?: number; limite?: number }) {
  return apiFetch<ListaResponse<CalificacionCliente>>(
    `/calificaciones/mis-calificaciones${queryString(filtros)}`
  );
}

export async function crearCalificacion(payload: NuevaCalificacionPayload) {
  return apiFetch<ApiResponse<{ calificacion: CalificacionCliente }>>("/calificaciones", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
