import type { RequestHandler } from "express";
import { serviciosService } from "../services/servicios.service";
import type {
  ActualizarServicioBarberoInput,
  ActualizarServicioInput,
  AsignarServicioBarberoInput,
  CrearServicioInput,
  FiltrosServiciosInput
} from "../validators/servicios.validator";

export const listarServicios: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await serviciosService.listar(
      req.query as unknown as FiltrosServiciosInput
    );

    res.json({
      exito: true,
      mensaje: "Servicios consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerServicio: RequestHandler = async (req, res, next) => {
  try {
    const servicio = await serviciosService.obtener(req.params.idServicio);

    res.json({
      exito: true,
      mensaje: "Servicio consultado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const crearServicio: RequestHandler = async (req, res, next) => {
  try {
    const servicio = await serviciosService.crear(
      req.body as CrearServicioInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Servicio creado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarServicio: RequestHandler = async (req, res, next) => {
  try {
    const servicio = await serviciosService.actualizar(
      req.params.idServicio,
      req.body as ActualizarServicioInput
    );

    res.json({
      exito: true,
      mensaje: "Servicio actualizado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarServicio: RequestHandler = async (req, res, next) => {
  try {
    const servicio = await serviciosService.desactivar(req.params.idServicio);

    res.json({
      exito: true,
      mensaje: "Servicio desactivado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const listarServiciosPublicosBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const servicios = await serviciosService.listarPublicosBarbero(
      req.params.idBarbero
    );

    res.json({
      exito: true,
      mensaje: "Servicios del barbero consultados correctamente",
      datos: servicios
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisServiciosBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const servicios = await serviciosService.listarMisServicios(
      req.usuario!.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Mis servicios consultados correctamente",
      datos: servicios
    });
  } catch (error) {
    next(error);
  }
};

export const asignarServicioBarbero: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await serviciosService.asignar(
      req.usuario!.idUsuario,
      req.body as AsignarServicioBarberoInput
    );

    res.status(resultado.reactivado ? 200 : 201).json({
      exito: true,
      mensaje: resultado.reactivado
        ? "Servicio reactivado correctamente"
        : "Servicio asignado correctamente",
      datos: { servicio: resultado.servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarServicioBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const servicio = await serviciosService.actualizarAsignacion(
      req.usuario!.idUsuario,
      req.params.idServicioBarbero,
      req.body as ActualizarServicioBarberoInput
    );

    res.json({
      exito: true,
      mensaje: "Servicio del barbero actualizado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};

export const retirarServicioBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const servicio = await serviciosService.retirarAsignacion(
      req.usuario!.idUsuario,
      req.params.idServicioBarbero
    );

    res.json({
      exito: true,
      mensaje: "Servicio retirado correctamente",
      datos: { servicio }
    });
  } catch (error) {
    next(error);
  }
};
