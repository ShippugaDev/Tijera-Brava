import { apiFetch } from "@/lib/api";
import type { ApiResponse, HistorialReserva, Paginacion, ReservaBarbero } from "@/lib/types";

type ListaResponse<T> = ApiResponse<T[]> & { paginacion?: Paginacion };

const queryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export async function listarReservasBarbero(filtros: {
  pagina?: number;
  limite?: number;
  estado?: string;
}) {
  return apiFetch<ListaResponse<ReservaBarbero>>(
    `/reservas/mis-servicios${queryString(filtros)}`
  );
}

export async function obtenerReservaBarbero(idReserva: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(`/reservas/${idReserva}`);
}

export async function obtenerHistorialReservaBarbero(idReserva: string) {
  return apiFetch<ApiResponse<{ historial: HistorialReserva[] }>>(
    `/reservas/${idReserva}/historial`
  );
}

export async function aceptarReservaBarbero(idReserva: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(`/reservas/${idReserva}/aceptar`, {
    method: "PATCH"
  });
}

export async function rechazarReservaBarbero(idReserva: string, motivo: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(`/reservas/${idReserva}/rechazar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo })
  });
}

export async function marcarReservaEnCamino(idReserva: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(
    `/reservas/${idReserva}/en-camino`,
    { method: "PATCH" }
  );
}

export async function iniciarServicioReserva(idReserva: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(
    `/reservas/${idReserva}/iniciar-servicio`,
    { method: "PATCH" }
  );
}

export async function finalizarServicioReserva(idReserva: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(
    `/reservas/${idReserva}/finalizar`,
    { method: "PATCH" }
  );
}

export async function cancelarReservaBarbero(idReserva: string, motivo: string) {
  return apiFetch<ApiResponse<{ reserva: ReservaBarbero }>>(
    `/reservas/${idReserva}/cancelar-barbero`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo })
    }
  );
}
