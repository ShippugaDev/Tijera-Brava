import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CalificacionModeracion,
  EstadoVisibilidadCalificacionModeracion,
  EstadoVisibilidadPortafolioModeracion,
  PortafolioModeracion
} from "@/lib/types";

type ModeracionPayload<TEstado extends string> = {
  estadoVisibilidad: TEstado;
  motivoModeracion?: string;
};

export const listarPortafoliosModeracionAdmin = () =>
  apiFetch<ApiResponse<PortafolioModeracion[]>>("/administracion/moderacion/portafolios");

export const listarCalificacionesModeracionAdmin = () =>
  apiFetch<ApiResponse<CalificacionModeracion[]>>(
    "/administracion/moderacion/calificaciones"
  );

export const moderarPortafolioAdmin = (
  idPortafolioCorte: string,
  data: ModeracionPayload<EstadoVisibilidadPortafolioModeracion>
) =>
  apiFetch<ApiResponse<{ portafolio: PortafolioModeracion }>>(
    `/portafolios/${idPortafolioCorte}/moderar`,
    {
      body: JSON.stringify(data),
      method: "PATCH"
    }
  );

export const moderarCalificacionAdmin = (
  idCalificacion: string,
  data: ModeracionPayload<EstadoVisibilidadCalificacionModeracion>
) =>
  apiFetch<ApiResponse<{ calificacion: CalificacionModeracion }>>(
    `/calificaciones/${idCalificacion}/moderar`,
    {
      body: JSON.stringify(data),
      method: "PATCH"
    }
  );
