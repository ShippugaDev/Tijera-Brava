import { ErrorAplicacion } from "../errors/error-aplicacion";
import { notificacionesRepository } from "../repositories/notificaciones.repository";
import type { FiltrosNotificacionesInput } from "../validators/notificaciones.validator";

const formatearNotificacion = (notificacion: Awaited<ReturnType<typeof notificacionesRepository.buscarPorId>>) => {
  if (!notificacion) return null;
  return {
    idNotificacion: notificacion.idNotificacion,
    tipo: notificacion.tipo,
    titulo: notificacion.titulo,
    mensaje: notificacion.mensaje,
    leida: notificacion.leida,
    enlaceAccion: notificacion.enlaceAccion,
    metadata: notificacion.metadata,
    fechaLectura: notificacion.fechaLectura,
    fechaCreacion: notificacion.fechaCreacion
  };
};

const paginar = <T>(datos: T[], totalRegistros: number, pagina: number, limite: number) => {
  const totalPaginas = Math.ceil(totalRegistros / limite);
  return {
    datos,
    paginacion: {
      pagina,
      limite,
      totalRegistros,
      totalPaginas,
      tieneSiguiente: pagina < totalPaginas,
      tieneAnterior: pagina > 1
    }
  };
};

export const notificacionesService = {
  async listar(idUsuario: string, filtros: FiltrosNotificacionesInput) {
    const { notificaciones, totalRegistros } = await notificacionesRepository.listarPorUsuario(
      idUsuario,
      filtros
    );

    return paginar(
      notificaciones.map((notificacion) => ({
        idNotificacion: notificacion.idNotificacion,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        leida: notificacion.leida,
        enlaceAccion: notificacion.enlaceAccion,
        metadata: notificacion.metadata,
        fechaLectura: notificacion.fechaLectura,
        fechaCreacion: notificacion.fechaCreacion
      })),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  contarNoLeidas(idUsuario: string) {
    return notificacionesRepository.contarNoLeidas(idUsuario);
  },

  async marcarLeida(idUsuario: string, idNotificacion: string) {
    const notificacion = await notificacionesRepository.buscarPorId(idNotificacion);
    if (!notificacion) throw new ErrorAplicacion("Notificación no encontrada", 404);
    if (notificacion.idUsuario !== idUsuario) {
      throw new ErrorAplicacion("No puedes leer esta notificación", 403);
    }
    if (notificacion.leida) return formatearNotificacion(notificacion);

    const actualizada = await notificacionesRepository.marcarLeida(idNotificacion);
    return formatearNotificacion(actualizada);
  },

  async marcarTodasLeidas(idUsuario: string) {
    const resultado = await notificacionesRepository.marcarTodasLeidas(idUsuario);
    return { totalActualizadas: resultado.count };
  }
};
