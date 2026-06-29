import type { ErrorRequestHandler } from "express";
import { ErrorAplicacion } from "../errors/error-aplicacion";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorAplicacion) {
    res.status(err.statusCode).json({
      exito: false,
      mensaje: err.message,
      errores: err.errores
    });
    return;
  }

  res.status(500).json({
    exito: false,
    mensaje: "Error interno del servidor",
    errores: []
  });
};
