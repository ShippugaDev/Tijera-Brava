import { EstadoPago, EstadoReserva, TipoNotificacion } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  pagosRepository,
  type PagoDetalle
} from "../repositories/pagos.repository";
import type {
  ObservacionObligatoriaInput,
  ObservacionOpcionalInput,
  RegistrarComprobanteInput
} from "../validators/pagos.validator";
import { notificacionesInternasService } from "./notificaciones-internas.service";

type UsuarioSesion = {
  idUsuario: string;
  rol: string;
};

const estadosConComprobantePermitido: EstadoPago[] = [
  EstadoPago.PENDIENTE,
  EstadoPago.COMPROBANTE_SUBIDO
];

const estadosConfirmables: EstadoPago[] = [
  EstadoPago.PENDIENTE,
  EstadoPago.COMPROBANTE_SUBIDO
];

const formatearPago = (pago: PagoDetalle) => ({
  idPago: pago.idPago,
  idReserva: pago.idReserva,
  metodoPago: pago.metodoPago,
  estadoPago: pago.estadoPago,
  montoServicio: Number(pago.montoServicio),
  montoTraslado: Number(pago.montoTraslado),
  montoTotal: Number(pago.montoTotal),
  comprobanteUrl: pago.comprobanteUrl,
  codigoOperacion: pago.codigoOperacion,
  observacion: pago.observacion,
  fechaConfirmacion: pago.fechaConfirmacion,
  fechaCreacion: pago.fechaCreacion,
  fechaActualizacion: pago.fechaActualizacion
});

const formatearHistorial = (pago: PagoDetalle) =>
  pago.historialPagos.map((historial) => ({
    idHistorialEstadoPago: historial.idHistorialEstadoPago,
    estadoAnterior: historial.estadoAnterior,
    estadoNuevo: historial.estadoNuevo,
    comentario: historial.comentario,
    fechaCreacion: historial.fechaCreacion,
    usuarioResponsable: historial.usuarioResponsable
  }));

const validarAccesoPago = (pago: PagoDetalle, usuario: UsuarioSesion) => {
  if (usuario.rol === "ADMINISTRADOR") return;
  if (
    usuario.rol === "CLIENTE" &&
    pago.reserva.cliente.usuario.idUsuario === usuario.idUsuario
  ) {
    return;
  }
  if (
    usuario.rol === "BARBERO" &&
    pago.reserva.barbero.usuario.idUsuario === usuario.idUsuario
  ) {
    return;
  }

  throw new ErrorAplicacion("No tienes autorización para este pago", 403);
};

const obtenerPagoAutorizado = async (idPago: string, usuario: UsuarioSesion) => {
  const pago = await pagosRepository.buscarPorId(idPago);

  if (!pago) {
    throw new ErrorAplicacion("Pago no encontrado", 404);
  }

  validarAccesoPago(pago, usuario);

  return pago;
};

export const pagosService = {
  async obtenerPagoReserva(idReserva: string, usuario: UsuarioSesion) {
    let pago = await pagosRepository.buscarPorReserva(idReserva);

    if (!pago) {
      pago = await pagosRepository.crearPagoFaltante(
        idReserva,
        usuario.idUsuario
      );
    }

    if (!pago) {
      throw new ErrorAplicacion("Reserva no encontrada", 404);
    }

    validarAccesoPago(pago, usuario);

    return formatearPago(pago);
  },

  async registrarComprobante(
    idReserva: string,
    usuario: UsuarioSesion,
    data: RegistrarComprobanteInput
  ) {
    let pago = await pagosRepository.buscarPorReserva(idReserva);

    if (!pago) {
      pago = await pagosRepository.crearPagoFaltante(
        idReserva,
        usuario.idUsuario
      );
    }

    if (!pago) {
      throw new ErrorAplicacion("Reserva no encontrada", 404);
    }

    if (
      usuario.rol !== "CLIENTE" ||
      pago.reserva.cliente.usuario.idUsuario !== usuario.idUsuario
    ) {
      throw new ErrorAplicacion("No puedes registrar este comprobante", 403);
    }

    if (
      !estadosConComprobantePermitido.includes(pago.estadoPago)
    ) {
      throw new ErrorAplicacion(
        "El estado del pago no permite registrar comprobante",
        409
      );
    }

    const actualizado = await pagosRepository.registrarComprobante(
      pago.idPago,
      pago.estadoPago,
      data,
      usuario.idUsuario
    );

    await notificacionesInternasService.crearNotificacion({
      idUsuario: actualizado.reserva.barbero.usuario.idUsuario,
      tipo: TipoNotificacion.PAGO_COMPROBANTE_SUBIDO,
      titulo: "Comprobante de pago recibido",
      mensaje: "El cliente subió un comprobante de pago para una reserva.",
      enlaceAccion: `/pagos/${actualizado.idPago}`,
      metadata: { idPago: actualizado.idPago, idReserva: actualizado.idReserva }
    });

    return formatearPago(actualizado);
  },

  async confirmar(
    idPago: string,
    usuario: UsuarioSesion,
    data: ObservacionOpcionalInput
  ) {
    const pago = await obtenerPagoAutorizado(idPago, usuario);

    if (
      usuario.rol !== "ADMINISTRADOR" &&
      !(
        usuario.rol === "BARBERO" &&
        pago.reserva.barbero.usuario.idUsuario === usuario.idUsuario
      )
    ) {
      throw new ErrorAplicacion("No puedes confirmar este pago", 403);
    }

    if (
      !estadosConfirmables.includes(pago.estadoPago)
    ) {
      throw new ErrorAplicacion("El pago no puede confirmarse en su estado actual", 409);
    }

    const actualizado = await pagosRepository.cambiarEstado({
      idPago,
      estadoAnterior: pago.estadoPago,
      estadoNuevo: EstadoPago.CONFIRMADO,
      idUsuarioResponsable: usuario.idUsuario,
      observacion: data.observacion,
      fechaConfirmacion: new Date()
    });

    await notificacionesInternasService.crearNotificacion({
      idUsuario: actualizado.reserva.cliente.usuario.idUsuario,
      tipo: TipoNotificacion.PAGO_CONFIRMADO,
      titulo: "Pago confirmado",
      mensaje: "Tu pago fue confirmado correctamente.",
      enlaceAccion: `/pagos/${actualizado.idPago}`,
      metadata: { idPago: actualizado.idPago, idReserva: actualizado.idReserva }
    });

    return formatearPago(actualizado);
  },

  async cancelar(
    idPago: string,
    usuario: UsuarioSesion,
    data: ObservacionObligatoriaInput
  ) {
    const pago = await obtenerPagoAutorizado(idPago, usuario);

    if (usuario.rol !== "ADMINISTRADOR") {
      throw new ErrorAplicacion("Solo administración puede cancelar pagos", 403);
    }

    if (
      pago.estadoPago === EstadoPago.CONFIRMADO &&
      pago.reserva.estadoReserva === EstadoReserva.FINALIZADA
    ) {
      throw new ErrorAplicacion(
        "No se puede cancelar un pago confirmado de una reserva finalizada",
        422
      );
    }

    const actualizado = await pagosRepository.cambiarEstado({
      idPago,
      estadoAnterior: pago.estadoPago,
      estadoNuevo: EstadoPago.CANCELADO,
      idUsuarioResponsable: usuario.idUsuario,
      observacion: data.observacion
    });

    await notificacionesInternasService.crearNotificacion({
      idUsuario: actualizado.reserva.cliente.usuario.idUsuario,
      tipo: TipoNotificacion.PAGO_CANCELADO,
      titulo: "Pago cancelado",
      mensaje: "Administración canceló el pago de tu reserva.",
      enlaceAccion: `/pagos/${actualizado.idPago}`,
      metadata: { idPago: actualizado.idPago, idReserva: actualizado.idReserva }
    });

    return formatearPago(actualizado);
  },

  async reembolsar(
    idPago: string,
    usuario: UsuarioSesion,
    data: ObservacionObligatoriaInput
  ) {
    const pago = await obtenerPagoAutorizado(idPago, usuario);

    if (usuario.rol !== "ADMINISTRADOR") {
      throw new ErrorAplicacion("Solo administración puede reembolsar pagos", 403);
    }

    if (pago.estadoPago !== EstadoPago.CONFIRMADO) {
      throw new ErrorAplicacion("Solo se pueden reembolsar pagos confirmados", 409);
    }

    const actualizado = await pagosRepository.cambiarEstado({
      idPago,
      estadoAnterior: pago.estadoPago,
      estadoNuevo: EstadoPago.REEMBOLSADO,
      idUsuarioResponsable: usuario.idUsuario,
      observacion: data.observacion
    });

    await notificacionesInternasService.crearNotificacion({
      idUsuario: actualizado.reserva.cliente.usuario.idUsuario,
      tipo: TipoNotificacion.PAGO_REEMBOLSADO,
      titulo: "Pago reembolsado",
      mensaje: "Administración registró el reembolso de tu pago.",
      enlaceAccion: `/pagos/${actualizado.idPago}`,
      metadata: { idPago: actualizado.idPago, idReserva: actualizado.idReserva }
    });

    return formatearPago(actualizado);
  },

  async obtenerHistorial(idPago: string, usuario: UsuarioSesion) {
    const pago = await obtenerPagoAutorizado(idPago, usuario);

    return formatearHistorial(pago);
  }
};
