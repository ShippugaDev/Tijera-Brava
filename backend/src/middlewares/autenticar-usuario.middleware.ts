import type { RequestHandler } from "express";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import { obtenerCookieSesion, verificarTokenSesion } from "../utils/jwt";

export const autenticarUsuario: RequestHandler = (req, _res, next) => {
  try {
    const token = req.cookies?.[obtenerCookieSesion()];

    if (!token || typeof token !== "string") {
      throw new ErrorAplicacion("Autenticación requerida", 401);
    }

    const payload = verificarTokenSesion(token);

    req.usuario = {
      idUsuario: payload.idUsuario,
      rol: payload.rol
    };

    next();
  } catch (error) {
    next(error);
  }
};
