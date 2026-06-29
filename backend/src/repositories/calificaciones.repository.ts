import { EstadoVisibilidadCalificacion, type Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  CrearCalificacionInput,
  FiltrosCalificacionesPublicasInput,
  FiltrosMisCalificacionesInput,
  ModerarCalificacionInput
} from "../validators/calificaciones.validator";

const calificacionInclude = {
  cliente: {
    include: {
      usuario: {
        select: {
          idUsuario: true,
          nombres: true,
          apellidos: true,
          correo: true
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
          correo: true
        }
      }
    }
  },
  reserva: {
    select: {
      idReserva: true,
      fechaReserva: true,
      horaInicio: true,
      horaFin: true,
      estadoReserva: true
    }
  }
} satisfies Prisma.CalificacionInclude;

export type CalificacionDetalle = Prisma.CalificacionGetPayload<{
  include: typeof calificacionInclude;
}>;

export const calificacionesRepository = {
  buscarClientePorUsuario(idUsuario: string) {
    return prisma.cliente.findUnique({ where: { idUsuario }, include: { usuario: true } });
  },

  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({ where: { idUsuario }, include: { usuario: true } });
  },

  buscarReserva(idReserva: string) {
    return prisma.reserva.findUnique({
      where: { idReserva },
      include: {
        cliente: { include: { usuario: true } },
        barbero: { include: { usuario: true } },
        calificacion: true
      }
    });
  },

  crear(data: CrearCalificacionInput & { idCliente: string; idBarbero: string }) {
    return prisma.calificacion.create({
      data: {
        idReserva: data.idReserva,
        idCliente: data.idCliente,
        idBarbero: data.idBarbero,
        puntuacion: data.puntuacion,
        comentario: data.comentario,
        estadoVisibilidad: EstadoVisibilidadCalificacion.VISIBLE
      },
      include: calificacionInclude
    });
  },

  async listarPublicas(idBarbero: string, filtros: FiltrosCalificacionesPublicasInput) {
    const where: Prisma.CalificacionWhereInput = {
      idBarbero,
      estadoVisibilidad: EstadoVisibilidadCalificacion.VISIBLE,
      puntuacion: filtros.puntuacion
    };
    const skip = (filtros.pagina - 1) * filtros.limite;
    const [calificaciones, totalRegistros, resumen] = await prisma.$transaction([
      prisma.calificacion.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        include: calificacionInclude
      }),
      prisma.calificacion.count({ where }),
      prisma.calificacion.aggregate({
        where: {
          idBarbero,
          estadoVisibilidad: EstadoVisibilidadCalificacion.VISIBLE
        },
        _count: true,
        _avg: { puntuacion: true }
      })
    ]);

    return { calificaciones, totalRegistros, resumen };
  },

  async listarPorCliente(idCliente: string, filtros: FiltrosMisCalificacionesInput) {
    const where: Prisma.CalificacionWhereInput = { idCliente };
    const skip = (filtros.pagina - 1) * filtros.limite;
    const [calificaciones, totalRegistros] = await prisma.$transaction([
      prisma.calificacion.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        include: calificacionInclude
      }),
      prisma.calificacion.count({ where })
    ]);

    return { calificaciones, totalRegistros };
  },

  buscarPorId(idCalificacion: string) {
    return prisma.calificacion.findUnique({
      where: { idCalificacion },
      include: calificacionInclude
    });
  },

  moderar(idCalificacion: string, data: ModerarCalificacionInput) {
    return prisma.calificacion.update({
      where: { idCalificacion },
      data: {
        estadoVisibilidad: data.estadoVisibilidad,
        motivoModeracion:
          data.estadoVisibilidad === EstadoVisibilidadCalificacion.VISIBLE
            ? null
            : data.motivoModeracion
      },
      include: calificacionInclude
    });
  }
};
