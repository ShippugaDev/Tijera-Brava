import type { NextFunction, Request, Response } from "express";
import type { ParsedQs } from "qs";
import type { ZodSchema } from "zod";
import { ErrorAplicacion } from "../errors/error-aplicacion";

export const validarSolicitud =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      next(
        new ErrorAplicacion(
          "Datos de solicitud inválidos",
          400,
          resultado.error.issues.map((issue) => issue.message)
        )
      );
      return;
    }

    req.body = resultado.data;
    next();
  };

export const validarConsulta =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.query);

    if (!resultado.success) {
      next(
        new ErrorAplicacion(
          "Parámetros de consulta inválidos",
          400,
          resultado.error.issues.map((issue) => issue.message)
        )
      );
      return;
    }

    req.query = resultado.data as ParsedQs;
    next();
  };

export const validarParametros =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.params);

    if (!resultado.success) {
      next(
        new ErrorAplicacion(
          "Parámetros inválidos",
          400,
          resultado.error.issues.map((issue) => issue.message)
        )
      );
      return;
    }

    req.params = resultado.data as Record<string, string>;
    next();
  };
