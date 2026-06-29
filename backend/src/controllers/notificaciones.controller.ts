import type { RequestHandler } from "express";
import { notificacionesService } from "../services/notificaciones.service";
import type { FiltrosNotificacionesInput } from "../validators/notificaciones.validator";

export const listarMisNotificaciones: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await notificacionesService.listar(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosNotificacionesInput
    );
    res.json({
      exito: true,
      mensaje: "Notificaciones consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const contarMisNotificacionesNoLeidas: RequestHandler = async (req, res, next) => {
  try {
    const total = await notificacionesService.contarNoLeidas(req.usuario!.idUsuario);
    res.json({
      exito: true,
      mensaje: "Total de notificaciones no leídas consultado correctamente",
      datos: { total }
    });
  } catch (error) {
    next(error);
  }
};

export const marcarNotificacionLeida: RequestHandler = async (req, res, next) => {
  try {
    const notificacion = await notificacionesService.marcarLeida(
      req.usuario!.idUsuario,
      req.params.idNotificacion
    );
    res.json({
      exito: true,
      mensaje: "Notificación marcada como leída correctamente",
      datos: { notificacion }
    });
  } catch (error) {
    next(error);
  }
};

export const marcarTodasNotificacionesLeidas: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await notificacionesService.marcarTodasLeidas(req.usuario!.idUsuario);
    res.json({
      exito: true,
      mensaje: "Notificaciones marcadas como leídas correctamente",
      datos: resultado
    });
  } catch (error) {
    next(error);
  }
};
