import type { RequestHandler } from "express";
import { disponibilidadService } from "../services/disponibilidad.service";
import type {
  ActualizarBloqueoInput,
  ActualizarHorarioInput,
  ConsultaDisponibilidadInput,
  CrearBloqueoInput,
  CrearHorarioInput,
  FiltrosBloqueosInput
} from "../validators/disponibilidad.validator";

export const listarMisHorarios: RequestHandler = async (req, res, next) => {
  try {
    const horarios = await disponibilidadService.listarMisHorarios(
      req.usuario!.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Horarios consultados correctamente",
      datos: horarios
    });
  } catch (error) {
    next(error);
  }
};

export const crearHorario: RequestHandler = async (req, res, next) => {
  try {
    const horario = await disponibilidadService.crearHorario(
      req.usuario!.idUsuario,
      req.body as CrearHorarioInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Horario creado correctamente",
      datos: { horario }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarHorario: RequestHandler = async (req, res, next) => {
  try {
    const horario = await disponibilidadService.actualizarHorario(
      req.usuario!.idUsuario,
      req.params.idHorarioDisponibilidad,
      req.body as ActualizarHorarioInput
    );

    res.json({
      exito: true,
      mensaje: "Horario actualizado correctamente",
      datos: { horario }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarHorario: RequestHandler = async (req, res, next) => {
  try {
    const horario = await disponibilidadService.desactivarHorario(
      req.usuario!.idUsuario,
      req.params.idHorarioDisponibilidad
    );

    res.json({
      exito: true,
      mensaje: "Horario desactivado correctamente",
      datos: { horario }
    });
  } catch (error) {
    next(error);
  }
};

export const reactivarHorario: RequestHandler = async (req, res, next) => {
  try {
    const horario = await disponibilidadService.reactivarHorario(
      req.usuario!.idUsuario,
      req.params.idHorarioDisponibilidad
    );

    res.json({
      exito: true,
      mensaje: "Horario reactivado correctamente",
      datos: { horario }
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisBloqueos: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await disponibilidadService.listarMisBloqueos(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosBloqueosInput
    );

    res.json({
      exito: true,
      mensaje: "Bloqueos consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const crearBloqueo: RequestHandler = async (req, res, next) => {
  try {
    const bloqueo = await disponibilidadService.crearBloqueo(
      req.usuario!.idUsuario,
      req.body as CrearBloqueoInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Bloqueo creado correctamente",
      datos: { bloqueo }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarBloqueo: RequestHandler = async (req, res, next) => {
  try {
    const bloqueo = await disponibilidadService.actualizarBloqueo(
      req.usuario!.idUsuario,
      req.params.idBloqueoHorario,
      req.body as ActualizarBloqueoInput
    );

    res.json({
      exito: true,
      mensaje: "Bloqueo actualizado correctamente",
      datos: { bloqueo }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarBloqueo: RequestHandler = async (req, res, next) => {
  try {
    const bloqueo = await disponibilidadService.desactivarBloqueo(
      req.usuario!.idUsuario,
      req.params.idBloqueoHorario
    );

    res.json({
      exito: true,
      mensaje: "Bloqueo desactivado correctamente",
      datos: { bloqueo }
    });
  } catch (error) {
    next(error);
  }
};

export const consultarDisponibilidadPublica: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const datos = await disponibilidadService.consultarDisponibilidadPublica(
      req.params.idBarbero,
      req.query as unknown as ConsultaDisponibilidadInput
    );

    res.json({
      exito: true,
      mensaje:
        datos.horarios.length > 0
          ? "Disponibilidad consultada correctamente"
          : "No hay horarios disponibles para la fecha seleccionada",
      datos
    });
  } catch (error) {
    next(error);
  }
};
