import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  BarberoPublico,
  CalificacionCliente,
  DisponibilidadBarbero,
  Paginacion,
  PortafolioCorte,
  ReservaCliente,
  ServicioBarbero,
  ZonaBarbero
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

export type FiltrosBarberos = {
  busqueda?: string;
  distrito?: string;
  calificacion_minima?: string;
  disponible?: boolean;
  pagina?: number;
  limite?: number;
};

export async function listarBarberos(filtros: FiltrosBarberos) {
  return apiFetch<ListaResponse<BarberoPublico>>(`/barberos${queryString(filtros)}`);
}

export async function obtenerBarbero(idBarbero: string) {
  return apiFetch<ApiResponse<{ barbero?: BarberoPublico } & BarberoPublico>>(
    `/barberos/${idBarbero}`
  );
}

export async function listarServiciosBarbero(idBarbero: string) {
  return apiFetch<ApiResponse<ServicioBarbero[]>>(`/barberos/${idBarbero}/servicios`);
}

export async function listarZonasBarbero(idBarbero: string) {
  return apiFetch<ApiResponse<ZonaBarbero[]>>(`/barberos/${idBarbero}/zonas`);
}

export async function listarPortafolioBarbero(idBarbero: string) {
  return apiFetch<ListaResponse<PortafolioCorte>>(`/barberos/${idBarbero}/portafolio`);
}

export async function listarCalificacionesBarbero(idBarbero: string) {
  return apiFetch<
    ApiResponse<{
      resumen?: {
        totalCalificaciones?: number;
        promedioCalificacion?: number;
      };
      calificaciones?: CalificacionCliente[];
    }> & {
      paginacion?: Paginacion;
    }
  >(`/barberos/${idBarbero}/calificaciones`);
}

export async function consultarDisponibilidad(params: {
  idBarbero: string;
  fecha: string;
  idServicio: string;
  idZonaCobertura: string;
}) {
  const { idBarbero, ...query } = params;
  return apiFetch<ApiResponse<DisponibilidadBarbero>>(
    `/barberos/${idBarbero}/disponibilidad${queryString(query)}`
  );
}

export async function crearReserva(payload: {
  idBarbero: string;
  idServicio: string;
  idZonaCobertura: string;
  fechaReserva: string;
  horaInicio: string;
  metodoPago: string;
  indicacionesCliente?: string;
}) {
  return apiFetch<ApiResponse<{ reserva: ReservaCliente }>>("/reservas", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listarMisReservas(filtros: {
  estado?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  limite?: number;
}) {
  return apiFetch<ListaResponse<ReservaCliente>>(
    `/reservas/mis-reservas${queryString(filtros)}`
  );
}

export async function cancelarReservaCliente(idReserva: string, motivo?: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaCliente }>>(
    `/reservas/${idReserva}/cancelar-cliente`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo })
    }
  );
}
