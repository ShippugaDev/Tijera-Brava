import jwt from "jsonwebtoken";
import { ErrorAplicacion } from "../errors/error-aplicacion";

export interface JwtPayloadSesion {
  idUsuario: string;
  rol: string;
}

const obtenerJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ErrorAplicacion("Configuración JWT incompleta", 500);
  }

  return secret;
};

export const obtenerCookieSesion = () =>
  process.env.COOKIE_NAME ?? "tijera_brava_sesion";

export const obtenerJwtExpiracion = () => process.env.JWT_EXPIRES_IN ?? "30m";

export const obtenerMaxAgeCookie = () => {
  const expiracion = obtenerJwtExpiracion();
  const coincidencia = /^(\d+)([smhd])$/.exec(expiracion);

  if (!coincidencia) {
    return 30 * 60 * 1000;
  }

  const valor = Number(coincidencia[1]);
  const unidad = coincidencia[2];
  const multiplicadores: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return valor * multiplicadores[unidad];
};

export const generarTokenSesion = (payload: JwtPayloadSesion) =>
  jwt.sign(payload, obtenerJwtSecret(), {
    expiresIn: obtenerJwtExpiracion()
  } as jwt.SignOptions);

export const verificarTokenSesion = (token: string): JwtPayloadSesion => {
  try {
    const payload = jwt.verify(token, obtenerJwtSecret());

    if (
      typeof payload === "object" &&
      typeof payload.idUsuario === "string" &&
      typeof payload.rol === "string"
    ) {
      return {
        idUsuario: payload.idUsuario,
        rol: payload.rol
      };
    }

    throw new ErrorAplicacion("Sesión inválida", 401);
  } catch (error) {
    if (error instanceof ErrorAplicacion) {
      throw error;
    }

    throw new ErrorAplicacion("Sesión inválida o expirada", 401);
  }
};
