import { EstadoAprobacion, TipoNotificacion } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  barberosRepository,
  type BarberoPerfil
} from "../repositories/barberos.repository";
import type {
  ActualizarPerfilBarberoInput,
  FiltrosBarberosPendientesInput,
  FiltrosBarberosPublicosInput,
  RechazarBarberoInput
} from "../validators/barberos.validator";
import { notificacionesInternasService } from "./notificaciones-internas.service";

const formatearBarbero = (barbero: BarberoPerfil) => ({
  usuario: {
    idUsuario: barbero.usuario.idUsuario,
    nombres: barbero.usuario.nombres,
    apellidos: barbero.usuario.apellidos,
    correo: barbero.usuario.correo,
    telefono: barbero.usuario.telefono,
    fotoPerfilUrl: barbero.usuario.fotoPerfilUrl,
    estadoCuenta: barbero.usuario.estadoCuenta,
    rol: barbero.usuario.rol.nombre
  },
  barbero: {
    idBarbero: barbero.idBarbero,
    idUsuario: barbero.idUsuario,
    nombreProfesional: barbero.nombreProfesional,
    biografia: barbero.biografia,
    anosExperiencia: barbero.anosExperiencia,
    estadoAprobacion: barbero.estadoAprobacion,
    calificacionPromedio: barbero.calificacionPromedio,
    totalServiciosRealizados: barbero.totalServiciosRealizados,
    disponible: barbero.disponible,
    fotoPerfilUrl: barbero.usuario.fotoPerfilUrl,
    fechaAprobacion: barbero.fechaAprobacion,
    motivoRechazo: null,
    fechaCreacion: barbero.fechaCreacion,
    fechaActualizacion: barbero.fechaActualizacion
  }
});

const formatearPendiente = (barbero: BarberoPerfil) => ({
  idBarbero: barbero.idBarbero,
  idUsuario: barbero.idUsuario,
  nombres: barbero.usuario.nombres,
  apellidos: barbero.usuario.apellidos,
  correo: barbero.usuario.correo,
  telefono: barbero.usuario.telefono,
  nombreProfesional: barbero.nombreProfesional,
  biografia: barbero.biografia,
  anosExperiencia: barbero.anosExperiencia,
  estadoAprobacion: barbero.estadoAprobacion,
  fechaCreacion: barbero.fechaCreacion
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

export const barberosService = {
  async listarPublicos(filtros: FiltrosBarberosPublicosInput) {
    const { barberos, totalRegistros } = await barberosRepository.listarPublicos(filtros);

    return paginar(
      barberos.map((barbero) => ({
        idBarbero: barbero.idBarbero,
        idUsuario: barbero.idUsuario,
        nombreProfesional: barbero.nombreProfesional,
        biografia: barbero.biografia,
        anosExperiencia: barbero.anosExperiencia,
        estadoAprobacion: barbero.estadoAprobacion,
        calificacionPromedio: Number(barbero.calificacionPromedio),
        totalServiciosRealizados: barbero.totalServiciosRealizados,
        disponible: barbero.disponible,
        fotoPerfilUrl: barbero.usuario.fotoPerfilUrl,
        usuario: {
          nombres: barbero.usuario.nombres,
          apellidos: barbero.usuario.apellidos,
          fotoPerfilUrl: barbero.usuario.fotoPerfilUrl
        },
        especialidades: barbero.especialidadesBarberos.map(
          (item) => item.especialidad.nombre
        )
      })),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  async obtenerPublico(idBarbero: string) {
    const barbero = await barberosRepository.buscarPublicoPorId(idBarbero);

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    const datos = formatearBarbero(barbero);

    return {
      ...datos,
      barbero: {
        ...datos.barbero,
        calificacionPromedio: Number(datos.barbero.calificacionPromedio)
      }
    };
  },

  async obtenerMiPerfil(idUsuario: string) {
    const barbero = await barberosRepository.buscarPerfilPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    return formatearBarbero(barbero);
  },

  async actualizarMiPerfil(
    idUsuario: string,
    data: ActualizarPerfilBarberoInput
  ) {
    const barberoExistente =
      await barberosRepository.buscarPerfilPorUsuario(idUsuario);

    if (!barberoExistente) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const barbero = await barberosRepository.actualizarPerfil(idUsuario, data);

    return formatearBarbero(barbero);
  },

  async listarPendientes(filtros: FiltrosBarberosPendientesInput) {
    const { barberos, totalRegistros } =
      await barberosRepository.listarPendientes(filtros);
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: barberos.map(formatearPendiente),
      paginacion: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        totalRegistros,
        totalPaginas,
        tieneSiguiente: filtros.pagina < totalPaginas,
        tieneAnterior: filtros.pagina > 1
      }
    };
  },

  async aprobar(idBarbero: string, idAdministrador: string) {
    const barbero = await barberosRepository.buscarPorId(idBarbero);

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    if (barbero.estadoAprobacion !== EstadoAprobacion.PENDIENTE) {
      throw new ErrorAplicacion(
        "Solo se pueden aprobar barberos pendientes",
        409
      );
    }

    const barberoActualizado = await barberosRepository.aprobar(
      idBarbero,
      idAdministrador
    );

    await notificacionesInternasService.crearNotificacion({
      idUsuario: barberoActualizado.idUsuario,
      tipo: TipoNotificacion.BARBERO_APROBADO,
      titulo: "Perfil de barbero aprobado",
      mensaje: "Tu perfil de barbero fue aprobado por administración.",
      enlaceAccion: "/barbero/mi-perfil",
      metadata: { idBarbero: barberoActualizado.idBarbero }
    });

    return formatearBarbero(barberoActualizado);
  },

  async rechazar(idBarbero: string, _data: RechazarBarberoInput) {
    const barbero = await barberosRepository.buscarPorId(idBarbero);

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    const barberoActualizado = await barberosRepository.rechazar(idBarbero);

    await notificacionesInternasService.crearNotificacion({
      idUsuario: barberoActualizado.idUsuario,
      tipo: TipoNotificacion.BARBERO_RECHAZADO,
      titulo: "Perfil de barbero rechazado",
      mensaje: "Tu perfil de barbero fue rechazado por administración.",
      enlaceAccion: "/barbero/mi-perfil",
      metadata: { idBarbero: barberoActualizado.idBarbero }
    });

    return formatearBarbero(barberoActualizado);
  },

  async suspender(idBarbero: string) {
    const barbero = await barberosRepository.buscarPorId(idBarbero);

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    const barberoActualizado = await barberosRepository.suspender(idBarbero);

    return formatearBarbero(barberoActualizado);
  }
};
