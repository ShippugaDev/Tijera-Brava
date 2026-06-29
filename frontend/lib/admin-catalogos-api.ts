import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CategoriaCorteAdmin,
  Paginacion,
  ServicioAdmin,
  ZonaCoberturaAdmin
} from "@/lib/types";

type RespuestaPaginada<T> = ApiResponse<T[]> & {
  paginacion?: Paginacion;
};

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
};

export type ServicioPayload = {
  nombre: string;
  descripcion?: string;
  precioBase: number;
  duracionMinutos: number;
};

export type CategoriaPayload = {
  nombre: string;
  descripcion?: string;
};

export type ZonaPayload = {
  nombre: string;
  distrito: string;
  provincia?: string;
  departamento?: string;
};

export const listarServiciosAdmin = (pagina = 1, limite = 50) =>
  apiFetch<RespuestaPaginada<ServicioAdmin>>(`/servicios${query({ pagina, limite })}`);

export const crearServicioAdmin = (data: ServicioPayload) =>
  apiFetch<ApiResponse<{ servicio: ServicioAdmin }>>("/servicios", {
    body: JSON.stringify(data),
    method: "POST"
  });

export const actualizarServicioAdmin = (idServicio: string, data: Partial<ServicioPayload>) =>
  apiFetch<ApiResponse<{ servicio: ServicioAdmin }>>(`/servicios/${idServicio}`, {
    body: JSON.stringify(data),
    method: "PATCH"
  });

export const desactivarServicioAdmin = (idServicio: string) =>
  apiFetch<ApiResponse<{ servicio: ServicioAdmin }>>(`/servicios/${idServicio}`, {
    method: "DELETE"
  });

export const listarCategoriasAdmin = (pagina = 1, limite = 50) =>
  apiFetch<RespuestaPaginada<CategoriaCorteAdmin>>(
    `/categorias-cortes${query({ pagina, limite })}`
  );

export const crearCategoriaAdmin = (data: CategoriaPayload) =>
  apiFetch<ApiResponse<{ categoria: CategoriaCorteAdmin }>>("/categorias-cortes", {
    body: JSON.stringify(data),
    method: "POST"
  });

export const actualizarCategoriaAdmin = (
  idCategoriaCorte: string,
  data: Partial<CategoriaPayload>
) =>
  apiFetch<ApiResponse<{ categoria: CategoriaCorteAdmin }>>(
    `/categorias-cortes/${idCategoriaCorte}`,
    {
      body: JSON.stringify(data),
      method: "PATCH"
    }
  );

export const desactivarCategoriaAdmin = (idCategoriaCorte: string) =>
  apiFetch<ApiResponse<{ categoria: CategoriaCorteAdmin }>>(
    `/categorias-cortes/${idCategoriaCorte}`,
    { method: "DELETE" }
  );

export const listarZonasAdmin = (pagina = 1, limite = 50, distrito?: string) =>
  apiFetch<RespuestaPaginada<ZonaCoberturaAdmin>>(
    `/zonas-cobertura${query({ pagina, limite, distrito })}`
  );

export const crearZonaAdmin = (data: ZonaPayload) =>
  apiFetch<ApiResponse<{ zona: ZonaCoberturaAdmin }>>("/zonas-cobertura", {
    body: JSON.stringify(data),
    method: "POST"
  });

export const actualizarZonaAdmin = (idZonaCobertura: string, data: Partial<ZonaPayload>) =>
  apiFetch<ApiResponse<{ zona: ZonaCoberturaAdmin }>>(`/zonas-cobertura/${idZonaCobertura}`, {
    body: JSON.stringify(data),
    method: "PATCH"
  });

export const desactivarZonaAdmin = (idZonaCobertura: string) =>
  apiFetch<ApiResponse<{ zona: ZonaCoberturaAdmin }>>(`/zonas-cobertura/${idZonaCobertura}`, {
    method: "DELETE"
  });
