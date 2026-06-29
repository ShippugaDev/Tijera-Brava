import { apiFetch } from "@/lib/api";
import type { ApiResponse, BarberoPublico, UsuarioSesion } from "@/lib/types";

export type PerfilBarberoPrivado = {
  usuario: UsuarioSesion & {
    telefono?: string | null;
  };
  barbero: BarberoPublico & {
    totalServiciosRealizados?: number;
    fechaAprobacion?: string | null;
    fechaCreacion?: string;
    fechaActualizacion?: string;
  };
};

export async function obtenerMiPerfilBarbero() {
  return apiFetch<ApiResponse<PerfilBarberoPrivado>>("/barberos/mi-perfil");
}
