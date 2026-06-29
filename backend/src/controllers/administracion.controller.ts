import type { RequestHandler } from "express";
import { administracionService } from "../services/administracion.service";
import type {
  FiltrosActividadRecienteAdminInput,
  FiltrosBarberosAdminInput,
  FiltrosLookIAAdminInput,
  FiltrosModeracionAdminInput,
  FiltrosPagosAdminInput,
  FiltrosReservasAdminInput,
  FiltrosServiciosAdminInput
} from "../validators/administracion.validator";

export const obtenerDashboardAdministracion: RequestHandler = async (_req, res, next) => {
  try {
    const datos = await administracionService.obtenerDashboard();
    res.json({
      exito: true,
      mensaje: "Dashboard consultado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticasReservas: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.estadisticasReservas(
      req.query as unknown as FiltrosReservasAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Estadísticas de reservas consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticasPagos: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.estadisticasPagos(
      req.query as unknown as FiltrosPagosAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Estadísticas de pagos consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticasServicios: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.estadisticasServicios(
      req.query as unknown as FiltrosServiciosAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Estadísticas de servicios consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticasBarberos: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.estadisticasBarberos(
      req.query as unknown as FiltrosBarberosAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Estadísticas de barberos consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticasLookIA: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.estadisticasLookIA(
      req.query as unknown as FiltrosLookIAAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Estadísticas de LookIA consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerActividadReciente: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.actividadReciente(
      req.query as unknown as FiltrosActividadRecienteAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Actividad reciente consultada correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const listarPortafoliosModeracion: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.listarPortafoliosModeracion(
      req.query as unknown as FiltrosModeracionAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Publicaciones de portafolio consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const listarCalificacionesModeracion: RequestHandler = async (req, res, next) => {
  try {
    const datos = await administracionService.listarCalificacionesModeracion(
      req.query as unknown as FiltrosModeracionAdminInput
    );
    res.json({
      exito: true,
      mensaje: "Calificaciones consultadas correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};
