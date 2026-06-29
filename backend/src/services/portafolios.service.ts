import {
  EstadoAprobacion,
  EstadoCuenta,
  EstadoVisibilidadPortafolio,
  TipoNotificacion
} from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  portafoliosRepository,
  type PortafolioDetalle
} from "../repositories/portafolios.repository";
import type {
  ActualizarPortafolioInput,
  CrearPortafolioInput,
  FiltrosMiPortafolioInput,
  FiltrosPortafolioPublicoInput,
  ModerarPortafolioInput
} from "../validators/portafolios.validator";
import { notificacionesInternasService } from "./notificaciones-internas.service";
import { subirImagenASupabaseStorage } from "./storage.service";

const formatearPortafolio = (portafolio: PortafolioDetalle) => ({
  idPortafolioCorte: portafolio.idPortafolioCorte,
  titulo: portafolio.titulo,
  descripcion: portafolio.descripcion,
  imagenUrl: portafolio.imagenUrl,
  destacado: portafolio.destacado,
  estadoVisibilidad: portafolio.estadoVisibilidad,
  motivoModeracion: portafolio.motivoModeracion,
  fechaCreacion: portafolio.fechaCreacion,
  fechaActualizacion: portafolio.fechaActualizacion,
  categoria: portafolio.categoriaCorte
    ? {
        idCategoriaCorte: portafolio.categoriaCorte.idCategoriaCorte,
        nombre: portafolio.categoriaCorte.nombre,
        slug: portafolio.categoriaCorte.slug
      }
    : null
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

const obtenerBarberoAprobado = async (idUsuario: string) => {
  const barbero = await portafoliosRepository.buscarBarberoPorUsuario(idUsuario);

  if (!barbero) throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
  if (barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del barbero no está activa", 403);
  }
  if (barbero.estadoAprobacion !== EstadoAprobacion.APROBADO) {
    throw new ErrorAplicacion("Solo barberos aprobados pueden publicar portafolio", 403);
  }

  return barbero;
};

const validarCategoria = async (idCategoriaCorte?: string) => {
  if (!idCategoriaCorte) return;
  const categoria = await portafoliosRepository.buscarCategoriaActiva(idCategoriaCorte);
  if (!categoria) throw new ErrorAplicacion("Categoría no encontrada o inactiva", 404);
};

export const portafoliosService = {
  async listarPublico(idBarbero: string, filtros: FiltrosPortafolioPublicoInput) {
    const barbero = await portafoliosRepository.buscarBarberoPublico(idBarbero);

    if (!barbero) throw new ErrorAplicacion("Barbero no encontrado", 404);
    if (
      barbero.estadoAprobacion !== EstadoAprobacion.APROBADO ||
      barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO
    ) {
      throw new ErrorAplicacion("Barbero no disponible públicamente", 404);
    }

    const { portafolios, totalRegistros } = await portafoliosRepository.listarPublico(
      idBarbero,
      filtros
    );

    return paginar(
      portafolios.map(formatearPortafolio),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  async listarPropio(idUsuario: string, filtros: FiltrosMiPortafolioInput) {
    const barbero = await portafoliosRepository.buscarBarberoPorUsuario(idUsuario);
    if (!barbero) throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);

    const { portafolios, totalRegistros } = await portafoliosRepository.listarPropio(
      barbero.idBarbero,
      filtros
    );

    return paginar(
      portafolios.map(formatearPortafolio),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  async crear(
    idUsuario: string,
    data: CrearPortafolioInput,
    archivo?: Express.Multer.File
  ) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    if (!archivo) {
      throw new ErrorAplicacion("Selecciona una imagen para el portafolio.", 400);
    }
    await validarCategoria(data.idCategoriaCorte);

    const imagenUrl = await subirImagenASupabaseStorage({
      bucket: process.env.SUPABASE_STORAGE_BUCKET_PORTAFOLIOS ?? "portafolios",
      carpeta: "barberos",
      archivo,
      prefijo: barbero.idBarbero
    });

    const portafolio = await portafoliosRepository.crear(barbero.idBarbero, {
      ...data,
      imagenUrl
    });
    return formatearPortafolio(portafolio);
  },

  async actualizar(
    idUsuario: string,
    idPortafolioCorte: string,
    data: ActualizarPortafolioInput,
    archivo?: Express.Multer.File
  ) {
    const barbero = await portafoliosRepository.buscarBarberoPorUsuario(idUsuario);
    if (!barbero) throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);

    const portafolio = await portafoliosRepository.buscarPorId(idPortafolioCorte);
    if (!portafolio) throw new ErrorAplicacion("Publicación no encontrada", 404);
    if (portafolio.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes editar esta publicación", 403);
    }
    if (portafolio.estadoVisibilidad === EstadoVisibilidadPortafolio.ELIMINADO) {
      throw new ErrorAplicacion("No se puede editar una publicación eliminada", 409);
    }

    await validarCategoria(data.idCategoriaCorte);
    const imagenUrl = archivo
      ? await subirImagenASupabaseStorage({
          bucket: process.env.SUPABASE_STORAGE_BUCKET_PORTAFOLIOS ?? "portafolios",
          carpeta: "barberos",
          archivo,
          prefijo: barbero.idBarbero
        })
      : undefined;
    const actualizada = await portafoliosRepository.actualizar(idPortafolioCorte, {
      ...data,
      ...(imagenUrl ? { imagenUrl } : {})
    });
    return formatearPortafolio(actualizada);
  },

  async eliminar(idUsuario: string, idPortafolioCorte: string) {
    const barbero = await portafoliosRepository.buscarBarberoPorUsuario(idUsuario);
    if (!barbero) throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);

    const portafolio = await portafoliosRepository.buscarPorId(idPortafolioCorte);
    if (!portafolio) throw new ErrorAplicacion("Publicación no encontrada", 404);
    if (portafolio.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes eliminar esta publicación", 403);
    }

    const eliminada = await portafoliosRepository.eliminar(idPortafolioCorte);
    return formatearPortafolio(eliminada);
  },

  async moderar(idPortafolioCorte: string, data: ModerarPortafolioInput) {
    const portafolio = await portafoliosRepository.buscarPorId(idPortafolioCorte);
    if (!portafolio) throw new ErrorAplicacion("Publicación no encontrada", 404);

    const moderada = await portafoliosRepository.moderar(idPortafolioCorte, data);

    await notificacionesInternasService.crearNotificacion({
      idUsuario: moderada.barbero.usuario.idUsuario,
      tipo: TipoNotificacion.PORTAFOLIO_MODERADO,
      titulo: "Publicación de portafolio moderada",
      mensaje: "Administración moderó una publicación de tu portafolio.",
      enlaceAccion: `/portafolios/${moderada.idPortafolioCorte}`,
      metadata: {
        idPortafolioCorte: moderada.idPortafolioCorte,
        estadoVisibilidad: moderada.estadoVisibilidad
      }
    });

    return formatearPortafolio(moderada);
  }
};
