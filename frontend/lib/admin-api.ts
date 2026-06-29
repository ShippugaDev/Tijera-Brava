import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  BarberoPendienteAdmin,
  Paginacion,
  RolUsuario,
  UsuarioAdmin
} from "@/lib/types";

type RespuestaPaginada<T> = ApiResponse<T[]> & {
  paginacion?: Paginacion;
};

export type FiltrosUsuariosAdmin = {
  rol?: RolUsuario | "";
  estado?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
};

const construirQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export async function listarUsuariosAdmin(filtros: FiltrosUsuariosAdmin = {}) {
  return apiFetch<RespuestaPaginada<UsuarioAdmin>>(
    `/usuarios${construirQuery({
      rol: filtros.rol,
      estado: filtros.estado,
      busqueda: filtros.busqueda,
      pagina: filtros.pagina ?? 1,
      limite: filtros.limite ?? 10
    })}`
  );
}

export async function cambiarEstadoUsuarioAdmin(
  idUsuario: string,
  estadoCuenta: string,
  motivo?: string
) {
  return apiFetch<ApiResponse<{ usuario: UsuarioAdmin }>>(`/usuarios/${idUsuario}/estado`, {
    body: JSON.stringify({ estadoCuenta, motivo }),
    method: "PATCH"
  });
}

export async function obtenerUsuarioAdmin(idUsuario: string) {
  return apiFetch<ApiResponse<{ usuario: UsuarioAdmin }>>(`/usuarios/${idUsuario}`);
}

export async function listarBarberosPendientesAdmin(filtros: {
  busqueda?: string;
  pagina?: number;
  limite?: number;
} = {}) {
  return apiFetch<RespuestaPaginada<BarberoPendienteAdmin>>(
    `/barberos/administracion/pendientes${construirQuery({
      busqueda: filtros.busqueda,
      pagina: filtros.pagina ?? 1,
      limite: filtros.limite ?? 10
    })}`
  );
}

export async function aprobarBarberoAdmin(idBarbero: string) {
  return apiFetch<ApiResponse<unknown>>(`/barberos/${idBarbero}/aprobar`, {
    method: "PATCH"
  });
}

export async function rechazarBarberoAdmin(idBarbero: string, motivo: string) {
  return apiFetch<ApiResponse<unknown>>(`/barberos/${idBarbero}/rechazar`, {
    body: JSON.stringify({ motivo }),
    method: "PATCH"
  });
}

export async function suspenderBarberoAdmin(idBarbero: string) {
  return apiFetch<ApiResponse<unknown>>(`/barberos/${idBarbero}/suspender`, {
    method: "PATCH"
  });
}
