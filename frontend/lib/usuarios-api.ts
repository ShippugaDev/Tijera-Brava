import { API_URL, ApiError, apiFetch } from "@/lib/api";
import type { ApiResponse, UsuarioSesion } from "@/lib/types";

export async function obtenerMiPerfilUsuario() {
  return apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>("/usuarios/mi-perfil");
}

export async function actualizarMiPerfilUsuario(data: {
  nombres: string;
  apellidos?: string;
  telefono?: string;
}) {
  return apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>("/usuarios/mi-perfil", {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export async function subirFotoPerfil(file: File) {
  const formData = new FormData();
  formData.append("foto", file);

  const response = await fetch(`${API_URL}/usuarios/mi-perfil/fotografia`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detalle = Array.isArray(data?.errores) ? data.errores[0] : null;
    throw new ApiError(
      detalle ?? data?.mensaje ?? "No se pudo subir la foto de perfil.",
      response.status
    );
  }

  return data as ApiResponse<{ usuario: UsuarioSesion }>;
}
