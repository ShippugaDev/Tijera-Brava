import type { EstadoPago, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { RegistrarComprobanteInput } from "../validators/pagos.validator";

const pagoInclude = {
  reserva: {
    include: {
      cliente: { include: { usuario: true } },
      barbero: { include: { usuario: true } },
      servicio: true,
      zonaCobertura: true
    }
  },
  historialPagos: {
    orderBy: { fechaCreacion: "asc" },
    include: {
      usuarioResponsable: {
        select: {
          idUsuario: true,
          nombres: true,
          apellidos: true,
          correo: true
        }
      }
    }
  }
} satisfies Prisma.PagoInclude;

export type PagoDetalle = Prisma.PagoGetPayload<{ include: typeof pagoInclude }>;

export const pagosRepository = {
  buscarPorReserva(idReserva: string) {
    return prisma.pago.findUnique({
      where: { idReserva },
      include: pagoInclude
    });
  },

  buscarPorId(idPago: string) {
    return prisma.pago.findUnique({
      where: { idPago },
      include: pagoInclude
    });
  },

  crearPagoFaltante(idReserva: string, idUsuarioResponsable?: string) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { idReserva },
        include: { pago: true }
      });

      if (!reserva) return null;
      if (reserva.pago) {
        return tx.pago.findUnique({ where: { idReserva }, include: pagoInclude });
      }

      return tx.pago.create({
        data: {
          idReserva,
          metodoPago: reserva.metodoPago,
          estadoPago: "PENDIENTE",
          montoServicio: reserva.precioServicio,
          montoTraslado: reserva.costoTraslado,
          montoTotal: reserva.total,
          historialPagos: {
            create: {
              estadoAnterior: null,
              estadoNuevo: "PENDIENTE",
              idUsuarioResponsable,
              comentario: "Pago inicial creado por backfill"
            }
          }
        },
        include: pagoInclude
      });
    });
  },

  registrarComprobante(
    idPago: string,
    estadoAnterior: EstadoPago,
    data: RegistrarComprobanteInput,
    idUsuarioResponsable: string
  ) {
    return prisma.pago.update({
      where: { idPago },
      data: {
        comprobanteUrl: data.comprobanteUrl,
        codigoOperacion: data.codigoOperacion,
        observacion: data.observacion,
        estadoPago: "COMPROBANTE_SUBIDO",
        historialPagos: {
          create: {
            estadoAnterior,
            estadoNuevo: "COMPROBANTE_SUBIDO",
            idUsuarioResponsable,
            comentario: data.observacion ?? "Comprobante registrado"
          }
        }
      },
      include: pagoInclude
    });
  },

  cambiarEstado(data: {
    idPago: string;
    estadoAnterior: EstadoPago;
    estadoNuevo: EstadoPago;
    idUsuarioResponsable: string;
    observacion?: string;
    fechaConfirmacion?: Date;
  }) {
    return prisma.pago.update({
      where: { idPago: data.idPago },
      data: {
        estadoPago: data.estadoNuevo,
        observacion: data.observacion,
        fechaConfirmacion: data.fechaConfirmacion,
        historialPagos: {
          create: {
            estadoAnterior: data.estadoAnterior,
            estadoNuevo: data.estadoNuevo,
            idUsuarioResponsable: data.idUsuarioResponsable,
            comentario: data.observacion
          }
        }
      },
      include: pagoInclude
    });
  }
};
