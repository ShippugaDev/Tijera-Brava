import type { RequestHandler } from "express";
import { calificacionesService } from "../services/calificaciones.service";
import type {
  CrearCalificacionInput,
  FiltrosCalificacionesPublicasInput,
  FiltrosMisCalificacionesInput,
  ModerarCalificacionInput
} from "../validators/calificaciones.validator";

const usuarioSesion = (req: Parameters<RequestHandler>[0]) => req.usuario!;

export const crearCalificacion: RequestHandler = async (req, res, next) => {
  try {
    const calificacion = await calificacionesService.crear(
      req.usuario!.idUsuario,
      req.body as CrearCalificacionInput
    );
    res.status(201).json({
      exito: true,
      mensaje: "Calificación registrada correctamente",
      datos: { calificacion }
    });
  } catch (error) {
    next(error);
  }
};

export const listarCalificacionesPublicas: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await calificacionesService.listarPublicas(
      req.params.idBarbero,
      req.query as unknown as FiltrosCalificacionesPublicasInput
    );
    res.json({
      exito: true,
      mensaje: "Calificaciones consultadas correctamente",
      datos: {
        resumen: resultado.resumen,
        calificaciones: resultado.calificaciones
      },
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisCalificaciones: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await calificacionesService.listarMias(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosMisCalificacionesInput
    );
    res.json({
      exito: true,
      mensaje: "Mis calificaciones consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerCalificacion: RequestHandler = async (req, res, next) => {
  try {
    const calificacion = await calificacionesService.obtener(
      req.params.idCalificacion,
      usuarioSesion(req)
    );
    res.json({
      exito: true,
      mensaje: "Calificación consultada correctamente",
      datos: { calificacion }
    });
  } catch (error) {
    next(error);
  }
};

export const moderarCalificacion: RequestHandler = async (req, res, next) => {
  try {
    const calificacion = await calificacionesService.moderar(
      req.params.idCalificacion,
      req.body as ModerarCalificacionInput
    );
    res.json({
      exito: true,
      mensaje: "Calificación moderada correctamente",
      datos: { calificacion }
    });
  } catch (error) {
    next(error);
  }
};
