import type { RequestHandler } from "express";
import { zonasCoberturaService } from "../services/zonas-cobertura.service";
import type {
  ActualizarZonaBarberoInput,
  ActualizarZonaCoberturaInput,
  AsignarZonaBarberoInput,
  CrearZonaCoberturaInput,
  FiltrosZonasCoberturaInput
} from "../validators/zonas-cobertura.validator";

export const listarZonasCobertura: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await zonasCoberturaService.listar(
      req.query as unknown as FiltrosZonasCoberturaInput
    );

    res.json({
      exito: true,
      mensaje: "Zonas de cobertura consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const crearZonaCobertura: RequestHandler = async (req, res, next) => {
  try {
    const zona = await zonasCoberturaService.crear(
      req.body as CrearZonaCoberturaInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Zona de cobertura creada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarZonaCobertura: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const zona = await zonasCoberturaService.actualizar(
      req.params.idZonaCobertura,
      req.body as ActualizarZonaCoberturaInput
    );

    res.json({
      exito: true,
      mensaje: "Zona de cobertura actualizada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarZonaCobertura: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const zona = await zonasCoberturaService.desactivar(
      req.params.idZonaCobertura
    );

    res.json({
      exito: true,
      mensaje: "Zona de cobertura desactivada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};

export const listarZonasPublicasBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const zonas = await zonasCoberturaService.listarPublicasBarbero(
      req.params.idBarbero
    );

    res.json({
      exito: true,
      mensaje: "Zonas del barbero consultadas correctamente",
      datos: zonas
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisZonasBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const zonas = await zonasCoberturaService.listarMisZonas(
      req.usuario!.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Mis zonas consultadas correctamente",
      datos: zonas
    });
  } catch (error) {
    next(error);
  }
};

export const asignarZonaBarbero: RequestHandler = async (req, res, next) => {
  try {
    const zona = await zonasCoberturaService.asignar(
      req.usuario!.idUsuario,
      req.body as AsignarZonaBarberoInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Zona asignada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarZonaBarbero: RequestHandler = async (req, res, next) => {
  try {
    const zona = await zonasCoberturaService.actualizarAsignacion(
      req.usuario!.idUsuario,
      req.params.idZonaBarbero,
      req.body as ActualizarZonaBarberoInput
    );

    res.json({
      exito: true,
      mensaje: "Zona del barbero actualizada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};

export const retirarZonaBarbero: RequestHandler = async (req, res, next) => {
  try {
    const zona = await zonasCoberturaService.retirarAsignacion(
      req.usuario!.idUsuario,
      req.params.idZonaBarbero
    );

    res.json({
      exito: true,
      mensaje: "Zona retirada correctamente",
      datos: { zona }
    });
  } catch (error) {
    next(error);
  }
};
