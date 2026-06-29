import type { EstadoReserva, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { finDelDiaEnZona, inicioDelDiaEnZona } from "../utils/fechas";
import { estadosQueOcupanAgenda } from "../utils/reservas";
import type {
  CrearReservaInput,
  FiltrosReservasInput
} from "../validators/reservas.validator";

const reservaInclude = {
  cliente: {
    include: {
      usuario: {
        select: {
          idUsuario: true,
          nombres: true,
          apellidos: true,
          correo: true,
          telefono: true
        }
      }
    }
  },
  barbero: {
    include: {
      usuario: {
        select: {
          idUsuario: true,
          nombres: true,
          apellidos: true,
          correo: true,
          telefono: true,
          estadoCuenta: true
        }
      }
    }
  },
  servicio: true,
  zonaCobertura: true,
  historialEstados: {
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
  },
  pago: true
} satisfies Prisma.ReservaInclude;

export type ReservaDetalle = Prisma.ReservaGetPayload<{
  include: typeof reservaInclude;
}>;

const construirWhereReservas = (filtros: FiltrosReservasInput) => {
  const where: Prisma.ReservaWhereInput = {};

  if (filtros.estado) where.estadoReserva = filtros.estado;
  if (filtros.idBarbero) where.idBarbero = filtros.idBarbero;
  if (filtros.idCliente) where.idCliente = filtros.idCliente;
  if (filtros.desde || filtros.hasta) {
    where.fechaReserva = {
      gte: filtros.desde ? inicioDelDiaEnZona(filtros.desde) : undefined,
      lt: filtros.hasta ? finDelDiaEnZona(filtros.hasta) : undefined
    };
  }

  return where;
};

export const reservasRepository = {
  buscarClientePorUsuario(idUsuario: string) {
    return prisma.cliente.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  buscarBarbero(idBarbero: string) {
    return prisma.barbero.findUnique({
      where: { idBarbero },
      include: { usuario: true }
    });
  },

  buscarServicioActivoBarbero(idBarbero: string, idServicio: string) {
    return prisma.servicioBarbero.findFirst({
      where: {
        idBarbero,
        idServicio,
        activo: true,
        servicio: { activo: true }
      },
      include: { servicio: true }
    });
  },

  buscarZonaActivaBarbero(idBarbero: string, idZonaCobertura: string) {
    return prisma.zonaBarbero.findFirst({
      where: {
        idBarbero,
        idZonaCobertura,
        activa: true,
        zonaCobertura: { activa: true }
      },
      include: { zonaCobertura: true }
    });
  },

  buscarReservasActivasEnRango(
    idBarbero: string,
    fechaReserva: Date,
    horaInicio: string,
    horaFin: string,
    idReservaExcluir?: string
  ) {
    return prisma.reserva.findMany({
      where: {
        idBarbero,
        fechaReserva,
        estadoReserva: { in: estadosQueOcupanAgenda },
        idReserva: idReservaExcluir ? { not: idReservaExcluir } : undefined,
        horaInicio: { lt: horaFin },
        horaFin: { gt: horaInicio }
      }
    });
  },

  crearReservaConHistorial(data: {
    clienteId: string;
    usuarioResponsableId: string;
    input: CrearReservaInput;
    fechaReserva: Date;
    horaFin: string;
    precioServicio: number;
    costoTraslado: number;
    total: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.create({
        data: {
          idCliente: data.clienteId,
          idBarbero: data.input.idBarbero,
          idServicio: data.input.idServicio,
          idZonaCobertura: data.input.idZonaCobertura,
          fechaReserva: data.fechaReserva,
          horaInicio: data.input.horaInicio,
          horaFin: data.horaFin,
          metodoPago: data.input.metodoPago,
          precioServicio: data.precioServicio,
          costoTraslado: data.costoTraslado,
          total: data.total,
          indicacionesCliente: data.input.indicacionesCliente,
          historialEstados: {
            create: {
              estadoAnterior: null,
              estadoNuevo: "PENDIENTE",
              idUsuarioResponsable: data.usuarioResponsableId,
              comentario: "Reserva creada"
            }
          },
          pago: {
            create: {
              metodoPago: data.input.metodoPago,
              estadoPago: "PENDIENTE",
              montoServicio: data.precioServicio,
              montoTraslado: data.costoTraslado,
              montoTotal: data.total,
              historialPagos: {
                create: {
                  estadoAnterior: null,
                  estadoNuevo: "PENDIENTE",
                  idUsuarioResponsable: data.usuarioResponsableId,
                  comentario: "Pago inicial creado"
                }
              }
            }
          }
        },
        include: reservaInclude
      });

      return reserva;
    });
  },

  async listar(filtros: FiltrosReservasInput, extraWhere: Prisma.ReservaWhereInput = {}) {
    const where = { ...construirWhereReservas(filtros), ...extraWhere };
    const skip = (filtros.pagina - 1) * filtros.limite;
    const [reservas, totalRegistros] = await prisma.$transaction([
      prisma.reserva.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: [{ fechaReserva: "desc" }, { horaInicio: "desc" }],
        include: reservaInclude
      }),
      prisma.reserva.count({ where })
    ]);

    return { reservas, totalRegistros };
  },

  buscarPorId(idReserva: string) {
    return prisma.reserva.findUnique({
      where: { idReserva },
      include: reservaInclude
    });
  },

  cambiarEstado(data: {
    idReserva: string;
    estadoAnterior: EstadoReserva;
    estadoNuevo: EstadoReserva;
    idUsuarioResponsable: string;
    comentario?: string;
    motivoCancelacion?: string;
  }) {
    return prisma.reserva.update({
      where: { idReserva: data.idReserva },
      data: {
        estadoReserva: data.estadoNuevo,
        motivoCancelacion: data.motivoCancelacion,
        historialEstados: {
          create: {
            estadoAnterior: data.estadoAnterior,
            estadoNuevo: data.estadoNuevo,
            idUsuarioResponsable: data.idUsuarioResponsable,
            comentario: data.comentario
          }
        }
      },
      include: reservaInclude
    });
  }
};
