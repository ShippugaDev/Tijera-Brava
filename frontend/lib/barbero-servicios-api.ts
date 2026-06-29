import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  Paginacion,
  ServicioBarberoAsignado,
  ServicioCatalogo
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

export async function listarCatalogoServicios(filtros: { pagina?: number; limite?: number }) {
  return apiFetch<ListaResponse<ServicioCatalogo>>(`/servicios${queryString(filtros)}`);
}

export async function listarMisServiciosBarbero() {
  return apiFetch<ApiResponse<ServicioBarberoAsignado[]>>("/barberos/mi-perfil/servicios");
}

export async function asignarServicioBarbero(payload: {
  idServicio: string;
  precioPersonalizado: number;
  duracionPersonalizada: number;
}) {
  return apiFetch<ApiResponse<{ servicio: ServicioBarberoAsignado }>>(
    "/barberos/mi-perfil/servicios",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function actualizarServicioBarbero(
  idServicioBarbero: string,
  payload: {
    precioPersonalizado: number;
    duracionPersonalizada: number;
  }
) {
  return apiFetch<ApiResponse<{ servicio: ServicioBarberoAsignado }>>(
    `/barberos/mi-perfil/servicios/${idServicioBarbero}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );
}

export async function retirarServicioBarbero(idServicioBarbero: string) {
  return apiFetch<ApiResponse<{ servicio: ServicioBarberoAsignado }>>(
    `/barberos/mi-perfil/servicios/${idServicioBarbero}`,
    { method: "DELETE" }
  );
}
