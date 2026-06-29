import { EstadoAprobacion, EstadoCuenta } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  zonasCoberturaRepository,
  type ZonaBarberoDetalle,
  type ZonaCatalogo
} from "../repositories/zonas-cobertura.repository";
import { generarSlug } from "../utils/slug";
import type {
  ActualizarZonaBarberoInput,
  ActualizarZonaCoberturaInput,
  AsignarZonaBarberoInput,
  CrearZonaCoberturaInput,
  FiltrosZonasCoberturaInput
} from "../validators/zonas-cobertura.validator";

const formatearZona = (zona: ZonaCatalogo) => ({
  idZonaCobertura: zona.idZonaCobertura,
  nombre: zona.nombre,
  slug: zona.slug,
  distrito: zona.distrito,
  provincia: zona.provincia,
  departamento: zona.departamento,
  activa: zona.activa,
  fechaCreacion: zona.fechaCreacion,
  fechaActualizacion: zona.fechaActualizacion
});

const formatearZonaBarbero = (asignacion: ZonaBarberoDetalle) => ({
  idZonaBarbero: asignacion.idZonaBarbero,
  idBarbero: asignacion.idBarbero,
  idZonaCobertura: asignacion.idZonaCobertura,
  costoTraslado:
    asignacion.costoTraslado === null ? null : Number(asignacion.costoTraslado),
  tiempoTrasladoMinutos: asignacion.tiempoTrasladoMinutos,
  activa: asignacion.activa,
  fechaCreacion: asignacion.fechaCreacion,
  fechaActualizacion: asignacion.fechaActualizacion,
  zonaCobertura: formatearZona(asignacion.zonaCobertura)
});

const obtenerBarberoAprobado = async (idUsuario: string) => {
  const barbero =
    await zonasCoberturaRepository.buscarBarberoPorUsuario(idUsuario);

  if (!barbero) {
    throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
  }

  if (barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del barbero no está activa", 403);
  }

  if (barbero.estadoAprobacion !== EstadoAprobacion.APROBADO) {
    throw new ErrorAplicacion(
      "Solo barberos aprobados pueden administrar zonas",
      403
    );
  }

  return barbero;
};

export const zonasCoberturaService = {
  async listar(filtros: FiltrosZonasCoberturaInput) {
    const { zonas, totalRegistros } = await zonasCoberturaRepository.listar(
      filtros
    );
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: zonas.map(formatearZona),
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

  async crear(data: CrearZonaCoberturaInput) {
    const slug = generarSlug(data.nombre);
    const duplicada = await zonasCoberturaRepository.buscarPorSlug(slug);

    if (duplicada) {
      throw new ErrorAplicacion("Ya existe una zona con ese nombre", 409);
    }

    const zona = await zonasCoberturaRepository.crear({ ...data, slug });

    return formatearZona(zona);
  },

  async actualizar(
    idZonaCobertura: string,
    data: ActualizarZonaCoberturaInput
  ) {
    const existente = await zonasCoberturaRepository.buscarPorId(
      idZonaCobertura
    );

    if (!existente) {
      throw new ErrorAplicacion("Zona de cobertura no encontrada", 404);
    }

    const dataActualizacion: ActualizarZonaCoberturaInput & { slug?: string } =
      { ...data };

    if (data.nombre) {
      const slug = generarSlug(data.nombre);
      const duplicada = await zonasCoberturaRepository.buscarOtraPorSlug(
        slug,
        idZonaCobertura
      );

      if (duplicada) {
        throw new ErrorAplicacion("Ya existe una zona con ese nombre", 409);
      }

      dataActualizacion.slug = slug;
    }

    const zona = await zonasCoberturaRepository.actualizar(
      idZonaCobertura,
      dataActualizacion
    );

    return formatearZona(zona);
  },

  async desactivar(idZonaCobertura: string) {
    const existente = await zonasCoberturaRepository.buscarPorId(
      idZonaCobertura
    );

    if (!existente) {
      throw new ErrorAplicacion("Zona de cobertura no encontrada", 404);
    }

    const zona = await zonasCoberturaRepository.desactivar(idZonaCobertura);

    return formatearZona(zona);
  },

  async listarPublicasBarbero(idBarbero: string) {
    const asignaciones =
      await zonasCoberturaRepository.listarPublicasBarbero(idBarbero);

    return asignaciones.map(formatearZonaBarbero);
  },

  async listarMisZonas(idUsuario: string) {
    const barbero =
      await zonasCoberturaRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignaciones = await zonasCoberturaRepository.listarBarbero(
      barbero.idBarbero
    );

    return asignaciones.map(formatearZonaBarbero);
  },

  async asignar(idUsuario: string, data: AsignarZonaBarberoInput) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    const zona = await zonasCoberturaRepository.buscarActivaPorId(
      data.idZonaCobertura
    );

    if (!zona) {
      throw new ErrorAplicacion("Zona de cobertura no encontrada o inactiva", 404);
    }

    const duplicada =
      await zonasCoberturaRepository.buscarAsignacionPorBarberoZona(
        barbero.idBarbero,
        data.idZonaCobertura
      );

    if (duplicada) {
      throw new ErrorAplicacion("La zona ya está asignada al barbero", 409);
    }

    const asignacion = await zonasCoberturaRepository.asignar(
      barbero.idBarbero,
      data
    );

    return formatearZonaBarbero(asignacion);
  },

  async actualizarAsignacion(
    idUsuario: string,
    idZonaBarbero: string,
    data: ActualizarZonaBarberoInput
  ) {
    const barbero =
      await zonasCoberturaRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignacion = await zonasCoberturaRepository.buscarAsignacion(
      idZonaBarbero
    );

    if (!asignacion) {
      throw new ErrorAplicacion("Zona del barbero no encontrada", 404);
    }

    if (asignacion.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes modificar esta zona", 403);
    }

    const actualizada = await zonasCoberturaRepository.actualizarAsignacion(
      idZonaBarbero,
      data
    );

    return formatearZonaBarbero(actualizada);
  },

  async retirarAsignacion(idUsuario: string, idZonaBarbero: string) {
    const barbero =
      await zonasCoberturaRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignacion = await zonasCoberturaRepository.buscarAsignacion(
      idZonaBarbero
    );

    if (!asignacion) {
      throw new ErrorAplicacion("Zona del barbero no encontrada", 404);
    }

    if (asignacion.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes retirar esta zona", 403);
    }

    const retirada = await zonasCoberturaRepository.retirarAsignacion(
      idZonaBarbero
    );

    return formatearZonaBarbero(retirada);
  }
};
