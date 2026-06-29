import type { RequestHandler } from "express";
import { barberosService } from "../services/barberos.service";
import type {
  ActualizarPerfilBarberoInput,
  FiltrosBarberosPendientesInput,
  FiltrosBarberosPublicosInput,
  RechazarBarberoInput
} from "../validators/barberos.validator";

export const listarBarberosPublicos: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await barberosService.listarPublicos(
      req.query as unknown as FiltrosBarberosPublicosInput
    );

    res.json({
      exito: true,
      mensaje: "Barberos consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerBarberoPublico: RequestHandler = async (req, res, next) => {
  try {
    const datos = await barberosService.obtenerPublico(req.params.idBarbero);

    res.json({
      exito: true,
      mensaje: "Barbero consultado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerMiPerfilBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const datos = await barberosService.obtenerMiPerfil(req.usuario!.idUsuario);

    res.json({
      exito: true,
      mensaje: "Perfil de barbero consultado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarMiPerfilBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const datos = await barberosService.actualizarMiPerfil(
      req.usuario!.idUsuario,
      req.body as ActualizarPerfilBarberoInput
    );

    res.json({
      exito: true,
      mensaje: "Perfil de barbero actualizado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const listarBarberosPendientes: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const resultado = await barberosService.listarPendientes(
      req.query as unknown as FiltrosBarberosPendientesInput
    );

    res.json({
      exito: true,
      mensaje: "Barberos pendientes consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const aprobarBarbero: RequestHandler = async (req, res, next) => {
  try {
    const datos = await barberosService.aprobar(
      req.params.idBarbero,
      req.usuario!.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Barbero aprobado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const rechazarBarbero: RequestHandler = async (req, res, next) => {
  try {
    const datos = await barberosService.rechazar(
      req.params.idBarbero,
      req.body as RechazarBarberoInput
    );

    res.json({
      exito: true,
      mensaje: "Barbero rechazado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const suspenderBarbero: RequestHandler = async (req, res, next) => {
  try {
    const datos = await barberosService.suspender(req.params.idBarbero);

    res.json({
      exito: true,
      mensaje: "Barbero suspendido correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};
