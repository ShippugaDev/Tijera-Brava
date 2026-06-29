import { EstadoReserva, TipoNotificacion } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  calificacionesRepository,
  type CalificacionDetalle
} from "../repositories/calificaciones.repository";
import type {
  CrearCalificacionInput,
  FiltrosCalificacionesPublicasInput,
  FiltrosMisCalificacionesInput,
  ModerarCalificacionInput
} from "../validators/calificaciones.validator";
import { notificacionesInternasService } from "./notificaciones-internas.service";

type UsuarioSesion = {
  idUsuario: string;
  rol: string;
};

const formatearCalificacion = (calificacion: CalificacionDetalle) => ({
  idCalificacion: calificacion.idCalificacion,
  idReserva: calificacion.idReserva,
  puntuacion: calificacion.puntuacion,
  comentario: calificacion.comentario,
  estadoVisibilidad: calificacion.estadoVisibilidad,
  motivoModeracion: calificacion.motivoModeracion,
  fechaCreacion: calificacion.fechaCreacion,
  fechaActualizacion: calificacion.fechaActualizacion,
  cliente: {
    idCliente: calificacion.idCliente,
    nombres: calificacion.cliente.usuario.nombres,
    apellidos: calificacion.cliente.usuario.apellidos
  },
  barbero: {
    idBarbero: calificacion.idBarbero,
    nombres: calificacion.barbero.usuario.nombres,
    apellidos: calificacion.barbero.usuario.apellidos
  },
  reserva: calificacion.reserva
});

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

const validarAccesoDetalle = (calificacion: CalificacionDetalle, usuario: UsuarioSesion) => {
  if (usuario.rol === "ADMINISTRADOR") return;
  if (usuario.rol === "CLIENTE" && calificacion.cliente.usuario.idUsuario === usuario.idUsuario) return;
  if (usuario.rol === "BARBERO" && calificacion.barbero.usuario.idUsuario === usuario.idUsuario) return;
  throw new ErrorAplicacion("No tienes autorización para esta calificación", 403);
};

export const calificacionesService = {
  async crear(idUsuario: string, data: CrearCalificacionInput) {
    const cliente = await calificacionesRepository.buscarClientePorUsuario(idUsuario);
    if (!cliente) throw new ErrorAplicacion("Cliente no encontrado", 404);

    const reserva = await calificacionesRepository.buscarReserva(data.idReserva);
    if (!reserva) throw new ErrorAplicacion("Reserva no encontrada", 404);
    if (reserva.idCliente !== cliente.idCliente) {
      throw new ErrorAplicacion("No puedes calificar una reserva ajena", 403);
    }
    if (reserva.estadoReserva !== EstadoReserva.FINALIZADA) {
      throw new ErrorAplicacion("Solo se pueden calificar reservas finalizadas", 422);
    }
    if (reserva.calificacion) {
      throw new ErrorAplicacion("La reserva ya tiene una calificación", 409);
    }

    const calificacion = await calificacionesRepository.crear({
      ...data,
      idCliente: cliente.idCliente,
      idBarbero: reserva.idBarbero
    });

    await notificacionesInternasService.crearNotificacion({
      idUsuario: calificacion.barbero.usuario.idUsuario,
      tipo: TipoNotificacion.CALIFICACION_RECIBIDA,
      titulo: "Nueva calificación recibida",
      mensaje: "Recibiste una nueva calificación de un cliente.",
      enlaceAccion: `/calificaciones/${calificacion.idCalificacion}`,
      metadata: {
        idCalificacion: calificacion.idCalificacion,
        idReserva: calificacion.idReserva,
        puntuacion: calificacion.puntuacion
      }
    });

    return formatearCalificacion(calificacion);
  },

  async listarPublicas(idBarbero: string, filtros: FiltrosCalificacionesPublicasInput) {
    const { calificaciones, totalRegistros, resumen } =
      await calificacionesRepository.listarPublicas(idBarbero, filtros);
    const resultado = paginar(
      calificaciones.map(formatearCalificacion),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );

    return {
      resumen: {
        totalCalificaciones: resumen._count,
        promedioCalificacion: Number((resumen._avg.puntuacion ?? 0).toFixed(2))
      },
      calificaciones: resultado.datos,
      paginacion: resultado.paginacion
    };
  },

  async listarMias(idUsuario: string, filtros: FiltrosMisCalificacionesInput) {
    const cliente = await calificacionesRepository.buscarClientePorUsuario(idUsuario);
    if (!cliente) throw new ErrorAplicacion("Cliente no encontrado", 404);

    const { calificaciones, totalRegistros } =
      await calificacionesRepository.listarPorCliente(cliente.idCliente, filtros);

    return paginar(
      calificaciones.map(formatearCalificacion),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  async obtener(idCalificacion: string, usuario: UsuarioSesion) {
    const calificacion = await calificacionesRepository.buscarPorId(idCalificacion);
    if (!calificacion) throw new ErrorAplicacion("Calificación no encontrada", 404);
    validarAccesoDetalle(calificacion, usuario);
    return formatearCalificacion(calificacion);
  },

  async moderar(idCalificacion: string, data: ModerarCalificacionInput) {
    const existente = await calificacionesRepository.buscarPorId(idCalificacion);
    if (!existente) throw new ErrorAplicacion("Calificación no encontrada", 404);
    const calificacion = await calificacionesRepository.moderar(idCalificacion, data);
    return formatearCalificacion(calificacion);
  }
};
