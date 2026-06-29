import type { RequestHandler } from "express";
import { ErrorAplicacion } from "../errors/error-aplicacion";

export const autorizarRoles =
  (...rolesPermitidos: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.usuario) {
      next(new ErrorAplicacion("Autenticación requerida", 401));
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      next(new ErrorAplicacion("No tienes autorización para esta acción", 403));
      return;
    }

    next();
  };
