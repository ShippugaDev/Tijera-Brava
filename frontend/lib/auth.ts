import { apiFetch, ApiError } from "./api";
import type { ApiResponse, RolUsuario, UsuarioSesion } from "./types";

export const rutaPorRol: Record<RolUsuario, string> = {
  CLIENTE: "/cliente",
  BARBERO: "/barbero",
  ADMINISTRADOR: "/administrador"
};

export async function iniciarSesion(correo: string, contrasena: string) {
  return apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>("/autenticacion/iniciar-sesion", {
    method: "POST",
    body: JSON.stringify({ correo, contrasena })
  });
}

export type RegistroClientePayload = {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasena: string;
};

export type RegistroBarberoPayload = RegistroClientePayload & {
  nombreProfesional: string;
  biografia?: string;
  anosExperiencia: number;
};

export async function registrarCliente(payload: RegistroClientePayload) {
  return apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>("/autenticacion/registro-cliente", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registrarBarbero(payload: RegistroBarberoPayload) {
  return apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>("/autenticacion/registro-barbero", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function obtenerSesionActual() {
  try {
    const response = await apiFetch<ApiResponse<{ usuario: UsuarioSesion }>>(
      "/autenticacion/mi-sesion"
    );
    return response.datos.usuario;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function cerrarSesion() {
  return apiFetch<ApiResponse<unknown>>("/autenticacion/cerrar-sesion", {
    method: "POST"
  });
}
