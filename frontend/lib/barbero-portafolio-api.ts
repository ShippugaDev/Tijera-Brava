import { API_URL, ApiError, apiFetch } from "@/lib/api";
import type { ApiResponse, CategoriaCorte, Paginacion, PortafolioCorte } from "@/lib/types";

type ListaResponse<T> = ApiResponse<T[]> & { paginacion?: Paginacion };

export type PortafolioPayload = {
  titulo: string;
  descripcion: string;
  imagen?: File | null;
  idCategoriaCorte: string;
  destacado?: boolean;
};

const queryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export async function listarMiPortafolio(filtros: {
  pagina?: number;
  limite?: number;
  estadoVisibilidad?: string;
  idCategoriaCorte?: string;
}) {
  return apiFetch<ListaResponse<PortafolioCorte>>(
    `/portafolios/mi-portafolio${queryString(filtros)}`
  );
}

export async function listarCategoriasCortes(filtros: { pagina?: number; limite?: number }) {
  return apiFetch<ListaResponse<CategoriaCorte>>(`/categorias-cortes${queryString(filtros)}`);
}

export async function crearPortafolio(payload: PortafolioPayload) {
  return enviarPortafolio("/portafolios", "POST", payload);
}

export async function actualizarPortafolio(idPortafolioCorte: string, payload: PortafolioPayload) {
  return enviarPortafolio(`/portafolios/${idPortafolioCorte}`, "PATCH", payload);
}

export async function eliminarPortafolio(idPortafolioCorte: string) {
  return apiFetch<ApiResponse<{ portafolio: PortafolioCorte }>>(
    `/portafolios/${idPortafolioCorte}`,
    { method: "DELETE" }
  );
}

async function enviarPortafolio(path: string, method: "POST" | "PATCH", payload: PortafolioPayload) {
  const formData = new FormData();
  formData.append("titulo", payload.titulo);
  formData.append("descripcion", payload.descripcion);
  formData.append("idCategoriaCorte", payload.idCategoriaCorte);
  formData.append("destacado", String(Boolean(payload.destacado)));
  if (payload.imagen) formData.append("imagen", payload.imagen);

  const response = await fetch(`${API_URL}${path}`, {
    method,
    body: formData,
    credentials: "include"
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detalle = Array.isArray(data?.errores) ? data.errores[0] : null;
    throw new ApiError(
      detalle ?? data?.mensaje ?? "No se pudo guardar la publicación.",
      response.status
    );
  }

  return data as ApiResponse<{ portafolio: PortafolioCorte }>;
}
