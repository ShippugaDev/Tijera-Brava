import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  BloqueoHorario,
  DiaSemana,
  HorarioDisponibilidad,
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

export async function listarMisHorarios() {
  return apiFetch<ApiResponse<HorarioDisponibilidad[]>>("/disponibilidad/mis-horarios");
}

export async function crearHorario(payload: {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}) {
  return apiFetch<ApiResponse<{ horario: HorarioDisponibilidad }>>(
    "/disponibilidad/mis-horarios",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function actualizarHorario(
  idHorarioDisponibilidad: string,
  payload: {
    diaSemana?: DiaSemana;
    horaInicio?: string;
    horaFin?: string;
    activo?: boolean;
  }
) {
  return apiFetch<ApiResponse<{ horario: HorarioDisponibilidad }>>(
    `/disponibilidad/mis-horarios/${idHorarioDisponibilidad}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );
}

export async function eliminarHorario(idHorarioDisponibilidad: string) {
  return apiFetch<ApiResponse<{ horario: HorarioDisponibilidad }>>(
    `/disponibilidad/mis-horarios/${idHorarioDisponibilidad}`,
    { method: "DELETE" }
  );
}

export async function reactivarHorario(idHorarioDisponibilidad: string) {
  return apiFetch<ApiResponse<{ horario: HorarioDisponibilidad }>>(
    `/disponibilidad/mis-horarios/${idHorarioDisponibilidad}/reactivar`,
    { method: "PATCH" }
  );
}

export async function listarMisBloqueos(filtros: {
  pagina?: number;
  limite?: number;
  desde?: string;
  hasta?: string;
  activo?: boolean;
}) {
  return apiFetch<ListaResponse<BloqueoHorario>>(
    `/disponibilidad/mis-bloqueos${queryString(filtros)}`
  );
}

export async function crearBloqueo(payload: {
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
}) {
  return apiFetch<ApiResponse<{ bloqueo: BloqueoHorario }>>(
    "/disponibilidad/mis-bloqueos",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function eliminarBloqueo(idBloqueoHorario: string) {
  return apiFetch<ApiResponse<{ bloqueo: BloqueoHorario }>>(
    `/disponibilidad/mis-bloqueos/${idBloqueoHorario}`,
    { method: "DELETE" }
  );
}
