import type { RequestHandler } from "express";
import { pagosService } from "../services/pagos.service";
import type {
  ObservacionObligatoriaInput,
  ObservacionOpcionalInput,
  RegistrarComprobanteInput
} from "../validators/pagos.validator";

const usuarioSesion = (req: Parameters<RequestHandler>[0]) => req.usuario!;

export const obtenerPagoReserva: RequestHandler = async (req, res, next) => {
  try {
    const pago = await pagosService.obtenerPagoReserva(
      req.params.idReserva,
      usuarioSesion(req)
    );

    res.json({
      exito: true,
      mensaje: "Pago consultado correctamente",
      datos: { pago }
    });
  } catch (error) {
    next(error);
  }
};

export const registrarComprobante: RequestHandler = async (req, res, next) => {
  try {
    const pago = await pagosService.registrarComprobante(
      req.params.idReserva,
      usuarioSesion(req),
      req.body as RegistrarComprobanteInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Comprobante registrado correctamente",
      datos: { pago }
    });
  } catch (error) {
    next(error);
  }
};

export const confirmarPago: RequestHandler = async (req, res, next) => {
  try {
    const pago = await pagosService.confirmar(
      req.params.idPago,
      usuarioSesion(req),
      req.body as ObservacionOpcionalInput
    );

    res.json({
      exito: true,
      mensaje: "Pago confirmado correctamente",
      datos: { pago }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelarPago: RequestHandler = async (req, res, next) => {
  try {
    const pago = await pagosService.cancelar(
      req.params.idPago,
      usuarioSesion(req),
      req.body as ObservacionObligatoriaInput
    );

    res.json({
      exito: true,
      mensaje: "Pago cancelado correctamente",
      datos: { pago }
    });
  } catch (error) {
    next(error);
  }
};

export const reembolsarPago: RequestHandler = async (req, res, next) => {
  try {
    const pago = await pagosService.reembolsar(
      req.params.idPago,
      usuarioSesion(req),
      req.body as ObservacionObligatoriaInput
    );

    res.json({
      exito: true,
      mensaje: "Pago reembolsado correctamente",
      datos: { pago }
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerHistorialPago: RequestHandler = async (req, res, next) => {
  try {
    const historial = await pagosService.obtenerHistorial(
      req.params.idPago,
      usuarioSesion(req)
    );

    res.json({
      exito: true,
      mensaje: "Historial de pago consultado correctamente",
      datos: { historial }
    });
  } catch (error) {
    next(error);
  }
};
