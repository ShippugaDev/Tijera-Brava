import { EstadoCuenta, EstadoSimulacionLookIA, TipoNotificacion } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  lookiaRepository,
  type EstiloLookIADetalle,
  type SimulacionLookIADetalle
} from "../repositories/lookia.repository";
import { generarUrlResultadoLookIA } from "../utils/lookia";
import { generarSlug } from "../utils/slug";
import type {
  ActualizarEstiloLookIAInput,
  CrearEstiloLookIAInput,
  CrearSimulacionLookIAInput,
  FiltrosEstilosLookIAInput,
  FiltrosSimulacionesLookIAInput
} from "../validators/lookia.validator";
import { notificacionesInternasService } from "./notificaciones-internas.service";
import { subirImagenASupabaseStorage } from "./storage.service";

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

const formatearEstilo = (estilo: EstiloLookIADetalle) => ({
  idEstiloLookIA: estilo.idEstiloLookIA,
  nombre: estilo.nombre,
  slug: estilo.slug,
  descripcion: estilo.descripcion,
  promptBase: estilo.promptBase,
  imagenReferenciaUrl: estilo.imagenReferenciaUrl,
  activo: estilo.activo,
  fechaCreacion: estilo.fechaCreacion,
  fechaActualizacion: estilo.fechaActualizacion,
  categoria: estilo.categoriaCorte
    ? {
        idCategoriaCorte: estilo.categoriaCorte.idCategoriaCorte,
        nombre: estilo.categoriaCorte.nombre,
        slug: estilo.categoriaCorte.slug
      }
    : null
});

const formatearSimulacion = (simulacion: SimulacionLookIADetalle) => ({
  idSimulacionLookIA: simulacion.idSimulacionLookIA,
  imagenOriginalUrl: simulacion.imagenOriginalUrl,
  imagenResultadoUrl: simulacion.imagenResultadoUrl,
  estadoSimulacion: simulacion.estadoSimulacion,
  consentimientoAceptado: simulacion.consentimientoAceptado,
  mensajeError: simulacion.mensajeError,
  fechaProcesamiento: simulacion.fechaProcesamiento,
  fechaCreacion: simulacion.fechaCreacion,
  fechaActualizacion: simulacion.fechaActualizacion,
  estilo: {
    idEstiloLookIA: simulacion.estiloLookIA.idEstiloLookIA,
    nombre: simulacion.estiloLookIA.nombre,
    slug: simulacion.estiloLookIA.slug,
    categoria: simulacion.estiloLookIA.categoriaCorte
      ? {
          idCategoriaCorte: simulacion.estiloLookIA.categoriaCorte.idCategoriaCorte,
          nombre: simulacion.estiloLookIA.categoriaCorte.nombre,
          slug: simulacion.estiloLookIA.categoriaCorte.slug
        }
      : null
  }
});

const obtenerClienteActivo = async (idUsuario: string) => {
  const cliente = await lookiaRepository.buscarClientePorUsuario(idUsuario);
  if (!cliente) throw new ErrorAplicacion("Perfil de cliente no encontrado", 404);
  if (cliente.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del cliente no está activa", 403);
  }
  return cliente;
};

const validarCategoriaActiva = async (idCategoriaCorte?: string | null) => {
  if (!idCategoriaCorte) return;
  const categoria = await lookiaRepository.buscarCategoriaActiva(idCategoriaCorte);
  if (!categoria) throw new ErrorAplicacion("Categoría no encontrada o inactiva", 404);
};

const validarSlugDisponible = async (slug: string, idEstiloActual?: string) => {
  const estilo = await lookiaRepository.buscarEstiloPorSlug(slug);
  if (estilo && estilo.idEstiloLookIA !== idEstiloActual) {
    throw new ErrorAplicacion("Ya existe un estilo de LookIA con ese nombre", 409);
  }
};

const obtenerVersionSiguiente = (imagenResultadoUrl?: string | null) => {
  if (!imagenResultadoUrl) return 2;
  const coincidencia = imagenResultadoUrl.match(/-v(\d+)\.jpg$/);
  if (!coincidencia) return 2;
  return Number(coincidencia[1]) + 1;
};

export const lookiaService = {
  async listarEstilos(filtros: FiltrosEstilosLookIAInput) {
    const { estilos, totalRegistros } = await lookiaRepository.listarEstilosActivos(filtros);
    return paginar(estilos.map(formatearEstilo), totalRegistros, filtros.pagina, filtros.limite);
  },

  async obtenerEstilo(idEstiloLookIA: string) {
    const estilo = await lookiaRepository.buscarEstiloActivo(idEstiloLookIA);
    if (!estilo) throw new ErrorAplicacion("Estilo de LookIA no encontrado", 404);
    return formatearEstilo(estilo);
  },

  async crearEstilo(data: CrearEstiloLookIAInput) {
    await validarCategoriaActiva(data.idCategoriaCorte);
    const slug = generarSlug(data.nombre);
    await validarSlugDisponible(slug);
    const estilo = await lookiaRepository.crearEstilo({ ...data, slug });
    return formatearEstilo(estilo);
  },

  async actualizarEstilo(idEstiloLookIA: string, data: ActualizarEstiloLookIAInput) {
    const estiloActual = await lookiaRepository.buscarEstiloPorId(idEstiloLookIA);
    if (!estiloActual) throw new ErrorAplicacion("Estilo de LookIA no encontrado", 404);

    await validarCategoriaActiva(data.idCategoriaCorte);

    let slug: string | undefined;
    if (data.nombre && data.nombre !== estiloActual.nombre) {
      slug = generarSlug(data.nombre);
      await validarSlugDisponible(slug, idEstiloLookIA);
    }

    const estilo = await lookiaRepository.actualizarEstilo(idEstiloLookIA, { ...data, slug });
    return formatearEstilo(estilo);
  },

  async desactivarEstilo(idEstiloLookIA: string) {
    const estiloActual = await lookiaRepository.buscarEstiloPorId(idEstiloLookIA);
    if (!estiloActual) throw new ErrorAplicacion("Estilo de LookIA no encontrado", 404);

    const estilo = await lookiaRepository.desactivarEstilo(idEstiloLookIA);
    return formatearEstilo(estilo);
  },

  async crearSimulacion(
    idUsuario: string,
    data: CrearSimulacionLookIAInput,
    archivo?: Express.Multer.File
  ) {
    const cliente = await obtenerClienteActivo(idUsuario);

    if (!archivo) {
      throw new ErrorAplicacion("Selecciona una imagen para generar la simulación.", 400);
    }

    const estilo = await lookiaRepository.buscarEstiloActivo(data.idEstiloLookIA);
    if (!estilo) throw new ErrorAplicacion("Estilo de LookIA no encontrado o inactivo", 404);

    const imagenOriginalUrl = await subirImagenASupabaseStorage({
      bucket: process.env.SUPABASE_STORAGE_BUCKET_LOOKIA ?? "lookia",
      carpeta: "originales",
      archivo,
      prefijo: idUsuario
    });

    const datosSimulacion = {
      ...data,
      imagenOriginalUrl
    };

    const simulacion = await lookiaRepository.crearSimulacionProcesada(
      cliente.idCliente,
      datosSimulacion,
      generarUrlResultadoLookIA
    );

    await notificacionesInternasService.crearNotificacion({
      idUsuario: cliente.idUsuario,
      tipo: TipoNotificacion.LOOKIA_COMPLETADA,
      titulo: "Simulación LookIA completada",
      mensaje: "Tu simulación LookIA fue generada correctamente.",
      enlaceAccion: `/lookia/simulaciones/${simulacion.idSimulacionLookIA}`,
      metadata: { idSimulacionLookIA: simulacion.idSimulacionLookIA }
    });

    return formatearSimulacion(simulacion);
  },

  async listarSimulaciones(idUsuario: string, filtros: FiltrosSimulacionesLookIAInput) {
    const cliente = await obtenerClienteActivo(idUsuario);
    const { simulaciones, totalRegistros } = await lookiaRepository.listarSimulaciones(
      cliente.idCliente,
      filtros
    );
    return paginar(
      simulaciones.map(formatearSimulacion),
      totalRegistros,
      filtros.pagina,
      filtros.limite
    );
  },

  async obtenerSimulacion(idUsuario: string, rol: string, idSimulacionLookIA: string) {
    const simulacion = await lookiaRepository.buscarSimulacionPorId(idSimulacionLookIA);
    if (!simulacion) throw new ErrorAplicacion("Simulación no encontrada", 404);

    if (rol !== "ADMINISTRADOR") {
      const cliente = await obtenerClienteActivo(idUsuario);
      if (simulacion.idCliente !== cliente.idCliente) {
        throw new ErrorAplicacion("No puedes consultar esta simulación", 403);
      }
    }

    return formatearSimulacion(simulacion);
  },

  async regenerarSimulacion(idUsuario: string, idSimulacionLookIA: string) {
    const cliente = await obtenerClienteActivo(idUsuario);
    const simulacion = await lookiaRepository.buscarSimulacionPorId(idSimulacionLookIA);
    if (!simulacion) throw new ErrorAplicacion("Simulación no encontrada", 404);
    if (simulacion.idCliente !== cliente.idCliente) {
      throw new ErrorAplicacion("No puedes regenerar esta simulación", 403);
    }
    if (simulacion.estadoSimulacion === EstadoSimulacionLookIA.ELIMINADA) {
      throw new ErrorAplicacion("No se puede regenerar una simulación eliminada", 422);
    }

    const version = obtenerVersionSiguiente(simulacion.imagenResultadoUrl);
    const actualizada = await lookiaRepository.regenerarSimulacion(
      idSimulacionLookIA,
      generarUrlResultadoLookIA(idSimulacionLookIA, version)
    );
    return formatearSimulacion(actualizada);
  },

  async eliminarSimulacion(idUsuario: string, idSimulacionLookIA: string) {
    const cliente = await obtenerClienteActivo(idUsuario);
    const simulacion = await lookiaRepository.buscarSimulacionPorId(idSimulacionLookIA);
    if (!simulacion) throw new ErrorAplicacion("Simulación no encontrada", 404);
    if (simulacion.idCliente !== cliente.idCliente) {
      throw new ErrorAplicacion("No puedes eliminar esta simulación", 403);
    }

    const eliminada = await lookiaRepository.eliminarSimulacion(idSimulacionLookIA);
    return formatearSimulacion(eliminada);
  },

  async listarBarberosRecomendados(idUsuario: string, idSimulacionLookIA: string) {
    const cliente = await obtenerClienteActivo(idUsuario);
    const simulacion = await lookiaRepository.buscarSimulacionPorId(idSimulacionLookIA);
    if (!simulacion) throw new ErrorAplicacion("Simulación no encontrada", 404);
    if (simulacion.idCliente !== cliente.idCliente) {
      throw new ErrorAplicacion("No puedes consultar recomendaciones de esta simulación", 403);
    }
    if (simulacion.estadoSimulacion === EstadoSimulacionLookIA.ELIMINADA) {
      throw new ErrorAplicacion("No se puede recomendar barberos para una simulación eliminada", 422);
    }

    const idCategoriaCorte = simulacion.estiloLookIA.idCategoriaCorte;
    const barberos = await lookiaRepository.listarBarberosRecomendados(idCategoriaCorte);

    return barberos.map((barbero) => {
      const totalCalificaciones = barbero.calificaciones.length;
      const promedioCalificacion =
        totalCalificaciones > 0
          ? Number(
              (
                barbero.calificaciones.reduce(
                  (total, calificacion) => total + calificacion.puntuacion,
                  0
                ) / totalCalificaciones
              ).toFixed(2)
            )
          : Number(barbero.calificacionPromedio);

      return {
        idBarbero: barbero.idBarbero,
        nombreProfesional: barbero.nombreProfesional,
        biografia: barbero.biografia,
        anosExperiencia: barbero.anosExperiencia,
        promedioCalificacion,
        totalCalificaciones,
        cantidadPortafolios: barbero.portafoliosCortes.length,
        publicacionesDestacadas: barbero.portafoliosCortes
      };
    });
  }
};
