import type { RequestHandler } from "express";
import { lookiaService } from "../services/lookia.service";
import type {
  ActualizarEstiloLookIAInput,
  CrearEstiloLookIAInput,
  CrearSimulacionLookIAInput,
  FiltrosEstilosLookIAInput,
  FiltrosSimulacionesLookIAInput
} from "../validators/lookia.validator";

export const listarEstilosLookIA: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await lookiaService.listarEstilos(
      req.query as unknown as FiltrosEstilosLookIAInput
    );
    res.json({
      exito: true,
      mensaje: "Estilos de LookIA consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstiloLookIA: RequestHandler = async (req, res, next) => {
  try {
    const estilo = await lookiaService.obtenerEstilo(req.params.idEstiloLookIA);
    res.json({
      exito: true,
      mensaje: "Estilo de LookIA consultado correctamente",
      datos: { estilo }
    });
  } catch (error) {
    next(error);
  }
};

export const crearEstiloLookIA: RequestHandler = async (req, res, next) => {
  try {
    const estilo = await lookiaService.crearEstilo(req.body as CrearEstiloLookIAInput);
    res.status(201).json({
      exito: true,
      mensaje: "Estilo de LookIA creado correctamente",
      datos: { estilo }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarEstiloLookIA: RequestHandler = async (req, res, next) => {
  try {
    const estilo = await lookiaService.actualizarEstilo(
      req.params.idEstiloLookIA,
      req.body as ActualizarEstiloLookIAInput
    );
    res.json({
      exito: true,
      mensaje: "Estilo de LookIA actualizado correctamente",
      datos: { estilo }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarEstiloLookIA: RequestHandler = async (req, res, next) => {
  try {
    const estilo = await lookiaService.desactivarEstilo(req.params.idEstiloLookIA);
    res.json({
      exito: true,
      mensaje: "Estilo de LookIA desactivado correctamente",
      datos: { estilo }
    });
  } catch (error) {
    next(error);
  }
};

export const crearSimulacionLookIA: RequestHandler = async (req, res, next) => {
  try {
    const simulacion = await lookiaService.crearSimulacion(
      req.usuario!.idUsuario,
      req.body as CrearSimulacionLookIAInput,
      req.file
    );
    res.status(201).json({
      exito: true,
      mensaje: "Simulación generada correctamente",
      datos: { simulacion }
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisSimulacionesLookIA: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await lookiaService.listarSimulaciones(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosSimulacionesLookIAInput
    );
    res.json({
      exito: true,
      mensaje: "Simulaciones consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerSimulacionLookIA: RequestHandler = async (req, res, next) => {
  try {
    const simulacion = await lookiaService.obtenerSimulacion(
      req.usuario!.idUsuario,
      req.usuario!.rol,
      req.params.idSimulacionLookIA
    );
    res.json({
      exito: true,
      mensaje: "Simulación consultada correctamente",
      datos: { simulacion }
    });
  } catch (error) {
    next(error);
  }
};

export const regenerarSimulacionLookIA: RequestHandler = async (req, res, next) => {
  try {
    const simulacion = await lookiaService.regenerarSimulacion(
      req.usuario!.idUsuario,
      req.params.idSimulacionLookIA
    );
    res.json({
      exito: true,
      mensaje: "Simulación regenerada correctamente",
      datos: { simulacion }
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarSimulacionLookIA: RequestHandler = async (req, res, next) => {
  try {
    const simulacion = await lookiaService.eliminarSimulacion(
      req.usuario!.idUsuario,
      req.params.idSimulacionLookIA
    );
    res.json({
      exito: true,
      mensaje: "Simulación eliminada correctamente",
      datos: { simulacion }
    });
  } catch (error) {
    next(error);
  }
};

export const listarBarberosRecomendadosLookIA: RequestHandler = async (req, res, next) => {
  try {
    const barberos = await lookiaService.listarBarberosRecomendados(
      req.usuario!.idUsuario,
      req.params.idSimulacionLookIA
    );
    res.json({
      exito: true,
      mensaje: "Barberos recomendados consultados correctamente",
      datos: { barberos }
    });
  } catch (error) {
    next(error);
  }
};
