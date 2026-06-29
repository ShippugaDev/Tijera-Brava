import type { RequestHandler } from "express";
import { especialidadesService } from "../services/especialidades.service";
import type {
  ActualizarEspecialidadInput,
  AsignarEspecialidadInput,
  CrearEspecialidadInput,
  FiltrosEspecialidadesInput
} from "../validators/especialidades.validator";

export const listarEspecialidades: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await especialidadesService.listar(
      req.query as unknown as FiltrosEspecialidadesInput
    );

    res.json({
      exito: true,
      mensaje: "Especialidades consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const crearEspecialidad: RequestHandler = async (req, res, next) => {
  try {
    const especialidad = await especialidadesService.crear(
      req.body as CrearEspecialidadInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Especialidad creada correctamente",
      datos: { especialidad }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarEspecialidad: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidad = await especialidadesService.actualizar(
      req.params.idEspecialidad,
      req.body as ActualizarEspecialidadInput
    );

    res.json({
      exito: true,
      mensaje: "Especialidad actualizada correctamente",
      datos: { especialidad }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarEspecialidad: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidad = await especialidadesService.desactivar(
      req.params.idEspecialidad
    );

    res.json({
      exito: true,
      mensaje: "Especialidad desactivada correctamente",
      datos: { especialidad }
    });
  } catch (error) {
    next(error);
  }
};

export const listarEspecialidadesPublicasBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidades =
      await especialidadesService.listarPublicasBarbero(req.params.idBarbero);

    res.json({
      exito: true,
      mensaje: "Especialidades del barbero consultadas correctamente",
      datos: especialidades
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisEspecialidadesBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidades =
      await especialidadesService.listarMisEspecialidades(req.usuario!.idUsuario);

    res.json({
      exito: true,
      mensaje: "Mis especialidades consultadas correctamente",
      datos: especialidades
    });
  } catch (error) {
    next(error);
  }
};

export const asignarEspecialidadBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidad = await especialidadesService.asignar(
      req.usuario!.idUsuario,
      req.body as AsignarEspecialidadInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Especialidad asignada correctamente",
      datos: { especialidad }
    });
  } catch (error) {
    next(error);
  }
};

export const retirarEspecialidadBarbero: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const especialidad = await especialidadesService.retirar(
      req.usuario!.idUsuario,
      req.params.idEspecialidadBarbero
    );

    res.json({
      exito: true,
      mensaje: "Especialidad retirada correctamente",
      datos: { especialidad }
    });
  } catch (error) {
    next(error);
  }
};
