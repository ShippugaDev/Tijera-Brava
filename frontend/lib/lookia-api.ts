import { API_URL, ApiError, apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  BarberoRecomendado,
  EstiloLookIA,
  Paginacion,
  SimulacionLookIA
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

export async function listarEstilosLookIA() {
  return apiFetch<ListaResponse<EstiloLookIA>>("/lookia/estilos");
}

export async function listarSimulacionesLookIA(filtros: {
  estadoSimulacion?: string;
  pagina?: number;
  limite?: number;
}) {
  return apiFetch<ListaResponse<SimulacionLookIA>>(
    `/lookia/simulaciones${queryString(filtros)}`
  );
}

export async function crearSimulacionLookIA(payload: {
  idEstiloLookIA: string;
  imagen: File;
  consentimientoAceptado: boolean;
}) {
  const formData = new FormData();
  formData.append("idEstiloLookIA", payload.idEstiloLookIA);
  formData.append("consentimientoAceptado", String(payload.consentimientoAceptado));
  formData.append("imagen", payload.imagen);

  const response = await fetch(`${API_URL}/lookia/simulaciones`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detalle = Array.isArray(data?.errores) ? data.errores[0] : null;
    throw new ApiError(
      detalle ?? data?.mensaje ?? "No se pudo crear la simulación.",
      response.status
    );
  }

  return data as ApiResponse<{ simulacion: SimulacionLookIA }>;
}

export async function obtenerSimulacionLookIA(idSimulacionLookIA: string) {
  return apiFetch<ApiResponse<{ simulacion: SimulacionLookIA }>>(
    `/lookia/simulaciones/${idSimulacionLookIA}`
  );
}

export async function regenerarSimulacionLookIA(idSimulacionLookIA: string) {
  return apiFetch<ApiResponse<{ simulacion: SimulacionLookIA }>>(
    `/lookia/simulaciones/${idSimulacionLookIA}/regenerar`,
    { method: "POST" }
  );
}

export async function eliminarSimulacionLookIA(idSimulacionLookIA: string) {
  return apiFetch<ApiResponse<{ simulacion: SimulacionLookIA }>>(
    `/lookia/simulaciones/${idSimulacionLookIA}`,
    { method: "DELETE" }
  );
}

export async function listarBarberosRecomendadosLookIA(idSimulacionLookIA: string) {
  return apiFetch<ApiResponse<{ barberos: BarberoRecomendado[] }>>(
    `/lookia/simulaciones/${idSimulacionLookIA}/barberos-recomendados`
  );
}
