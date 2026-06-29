import { TipoNotificacion, type Prisma } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import { notificacionesRepository } from "../repositories/notificaciones.repository";

export type CrearNotificacionInput = {
  idUsuario: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlaceAccion?: string;
  metadata?: Prisma.InputJsonValue;
};

export const notificacionesInternasService = {
  async crearNotificacion(data: CrearNotificacionInput) {
    const titulo = data.titulo.trim();
    const mensaje = data.mensaje.trim();

    if (!titulo) throw new ErrorAplicacion("El título de la notificación es obligatorio", 400);
    if (!mensaje) throw new ErrorAplicacion("El mensaje de la notificación es obligatorio", 400);
    if (!Object.values(TipoNotificacion).includes(data.tipo)) {
      throw new ErrorAplicacion("Tipo de notificación inválido", 400);
    }

    const usuario = await notificacionesRepository.buscarUsuario(data.idUsuario);
    if (!usuario) throw new ErrorAplicacion("Usuario destinatario no encontrado", 404);

    return notificacionesRepository.crear({
      ...data,
      titulo,
      mensaje
    });
  }
};
