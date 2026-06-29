import type { RequestHandler } from "express";
import { reservasService } from "../services/reservas.service";
import type {
  CrearReservaInput,
  FiltrosReservasInput,
  MotivoObligatorioInput,
  MotivoOpcionalInput
} from "../validators/reservas.validator";

const usuarioSesion = (req: Parameters<RequestHandler>[0]) => req.usuario!;

export const crearReserva: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.crearReserva(
      req.usuario!.idUsuario,
      req.body as CrearReservaInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Reserva creada correctamente",
      datos: { reserva }
    });
  } catch (error) {
    next(error);
  }
};

export const listarMisReservasCliente: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await reservasService.listarMisReservasCliente(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosReservasInput
    );

    res.json({ exito: true, mensaje: "Reservas consultadas correctamente", ...resultado });
  } catch (error) {
    next(error);
  }
};

export const listarMisServiciosBarbero: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await reservasService.listarMisServiciosBarbero(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosReservasInput
    );

    res.json({ exito: true, mensaje: "Reservas del barbero consultadas correctamente", ...resultado });
  } catch (error) {
    next(error);
  }
};

export const listarReservasAdmin: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await reservasService.listarTodas(
      req.query as unknown as FiltrosReservasInput
    );

    res.json({ exito: true, mensaje: "Reservas consultadas correctamente", ...resultado });
  } catch (error) {
    next(error);
  }
};

export const obtenerReserva: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.obtenerDetalle(
      req.params.idReserva,
      usuarioSesion(req)
    );

    res.json({
      exito: true,
      mensaje: "Reserva consultada correctamente",
      datos: { reserva }
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerHistorialReserva: RequestHandler = async (req, res, next) => {
  try {
    const historial = await reservasService.obtenerHistorial(
      req.params.idReserva,
      usuarioSesion(req)
    );

    res.json({
      exito: true,
      mensaje: "Historial consultado correctamente",
      datos: { historial }
    });
  } catch (error) {
    next(error);
  }
};

export const aceptarReserva: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.aceptar(req.params.idReserva, usuarioSesion(req));
    res.json({ exito: true, mensaje: "Reserva aceptada correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const rechazarReserva: RequestHandler = async (req, res, next) => {
  try {
    const { motivo } = req.body as MotivoObligatorioInput;
    const reserva = await reservasService.rechazar(req.params.idReserva, usuarioSesion(req), motivo);
    res.json({ exito: true, mensaje: "Reserva rechazada correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const marcarEnCamino: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.enCamino(req.params.idReserva, usuarioSesion(req));
    res.json({ exito: true, mensaje: "Reserva marcada en camino", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const iniciarServicio: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.iniciarServicio(req.params.idReserva, usuarioSesion(req));
    res.json({ exito: true, mensaje: "Servicio iniciado correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const finalizarServicio: RequestHandler = async (req, res, next) => {
  try {
    const reserva = await reservasService.finalizar(req.params.idReserva, usuarioSesion(req));
    res.json({ exito: true, mensaje: "Servicio finalizado correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const cancelarCliente: RequestHandler = async (req, res, next) => {
  try {
    const { motivo } = req.body as MotivoOpcionalInput;
    const reserva = await reservasService.cancelarCliente(req.params.idReserva, usuarioSesion(req), motivo);
    res.json({ exito: true, mensaje: "Reserva cancelada correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const cancelarBarbero: RequestHandler = async (req, res, next) => {
  try {
    const { motivo } = req.body as MotivoObligatorioInput;
    const reserva = await reservasService.cancelarBarbero(req.params.idReserva, usuarioSesion(req), motivo);
    res.json({ exito: true, mensaje: "Reserva cancelada por barbero correctamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};

export const cancelarAdministracion: RequestHandler = async (req, res, next) => {
  try {
    const { motivo } = req.body as MotivoObligatorioInput;
    const reserva = await reservasService.cancelarAdministracion(req.params.idReserva, usuarioSesion(req), motivo);
    res.json({ exito: true, mensaje: "Reserva cancelada administrativamente", datos: { reserva } });
  } catch (error) {
    next(error);
  }
};
