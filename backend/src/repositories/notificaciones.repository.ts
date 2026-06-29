import type { Prisma, TipoNotificacion } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { FiltrosNotificacionesInput } from "../validators/notificaciones.validator";

export type CrearNotificacionData = {
  idUsuario: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlaceAccion?: string;
  metadata?: Prisma.InputJsonValue;
};

export const notificacionesRepository = {
  buscarUsuario(idUsuario: string) {
    return prisma.usuario.findUnique({
      where: { idUsuario },
      select: { idUsuario: true }
    });
  },

  crear(data: CrearNotificacionData) {
    return prisma.notificacion.create({
      data: {
        idUsuario: data.idUsuario,
        tipo: data.tipo,
        titulo: data.titulo,
        mensaje: data.mensaje,
        enlaceAccion: data.enlaceAccion,
        metadata: data.metadata
      }
    });
  },

  async listarPorUsuario(idUsuario: string, filtros: FiltrosNotificacionesInput) {
    const where: Prisma.NotificacionWhereInput = {
      idUsuario,
      leida: filtros.leida,
      tipo: filtros.tipo
    };
    const skip = (filtros.pagina - 1) * filtros.limite;
    const [notificaciones, totalRegistros] = await prisma.$transaction([
      prisma.notificacion.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" }
      }),
      prisma.notificacion.count({ where })
    ]);

    return { notificaciones, totalRegistros };
  },

  contarNoLeidas(idUsuario: string) {
    return prisma.notificacion.count({
      where: {
        idUsuario,
        leida: false
      }
    });
  },

  buscarPorId(idNotificacion: string) {
    return prisma.notificacion.findUnique({
      where: { idNotificacion }
    });
  },

  marcarLeida(idNotificacion: string) {
    return prisma.notificacion.update({
      where: { idNotificacion },
      data: {
        leida: true,
        fechaLectura: new Date()
      }
    });
  },

  marcarTodasLeidas(idUsuario: string) {
    return prisma.notificacion.updateMany({
      where: {
        idUsuario,
        leida: false
      },
      data: {
        leida: true,
        fechaLectura: new Date()
      }
    });
  }
};
