import { EstadoAprobacion, EstadoCuenta } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  serviciosRepository,
  type ServicioBarberoDetalle,
  type ServicioCatalogo
} from "../repositories/servicios.repository";
import { generarSlug } from "../utils/slug";
import type {
  ActualizarServicioBarberoInput,
  ActualizarServicioInput,
  AsignarServicioBarberoInput,
  CrearServicioInput,
  FiltrosServiciosInput
} from "../validators/servicios.validator";

const formatearServicio = (servicio: ServicioCatalogo) => ({
  idServicio: servicio.idServicio,
  nombre: servicio.nombre,
  slug: servicio.slug,
  descripcion: servicio.descripcion,
  precioBase: Number(servicio.precioBase),
  duracionMinutos: servicio.duracionMinutos,
  activo: servicio.activo,
  fechaCreacion: servicio.fechaCreacion,
  fechaActualizacion: servicio.fechaActualizacion
});

const formatearServicioBarbero = (asignacion: ServicioBarberoDetalle) => {
  const precioBase = Number(asignacion.servicio.precioBase);
  const precioPersonalizado =
    asignacion.precioPersonalizado === null
      ? null
      : Number(asignacion.precioPersonalizado);
  const duracionPersonalizada = asignacion.duracionPersonalizada;

  return {
    idServicioBarbero: asignacion.idServicioBarbero,
    idBarbero: asignacion.idBarbero,
    idServicio: asignacion.idServicio,
    servicio: {
      idServicio: asignacion.servicio.idServicio,
      nombre: asignacion.servicio.nombre,
      slug: asignacion.servicio.slug,
      descripcion: asignacion.servicio.descripcion,
      precioBase,
      duracionMinutos: asignacion.servicio.duracionMinutos,
      activo: asignacion.servicio.activo
    },
    precioPersonalizado,
    precioFinal: precioPersonalizado ?? precioBase,
    duracionPersonalizada,
    duracionFinal:
      duracionPersonalizada ?? asignacion.servicio.duracionMinutos,
    activo: asignacion.activo,
    fechaCreacion: asignacion.fechaCreacion,
    fechaActualizacion: asignacion.fechaActualizacion
  };
};

const obtenerBarberoAprobado = async (idUsuario: string) => {
  const barbero = await serviciosRepository.buscarBarberoPorUsuario(idUsuario);

  if (!barbero) {
    throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
  }

  if (barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del barbero no está activa", 403);
  }

  if (barbero.estadoAprobacion !== EstadoAprobacion.APROBADO) {
    throw new ErrorAplicacion(
      "Solo barberos aprobados pueden administrar asignaciones",
      403
    );
  }

  return barbero;
};

export const serviciosService = {
  async listar(filtros: FiltrosServiciosInput) {
    const { servicios, totalRegistros } = await serviciosRepository.listar(
      filtros
    );
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: servicios.map(formatearServicio),
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

  async obtener(idServicio: string) {
    const servicio = await serviciosRepository.buscarActivoPorId(idServicio);

    if (!servicio) {
      throw new ErrorAplicacion("Servicio no encontrado", 404);
    }

    return formatearServicio(servicio);
  },

  async crear(data: CrearServicioInput) {
    const slug = generarSlug(data.nombre);
    const duplicado = await serviciosRepository.buscarPorSlug(slug);

    if (duplicado) {
      throw new ErrorAplicacion("Ya existe un servicio con ese nombre", 409);
    }

    const servicio = await serviciosRepository.crear({ ...data, slug });

    return formatearServicio(servicio);
  },

  async actualizar(idServicio: string, data: ActualizarServicioInput) {
    const existente = await serviciosRepository.buscarPorId(idServicio);

    if (!existente) {
      throw new ErrorAplicacion("Servicio no encontrado", 404);
    }

    const dataActualizacion: ActualizarServicioInput & { slug?: string } = {
      ...data
    };

    if (data.nombre) {
      const slug = generarSlug(data.nombre);
      const duplicado = await serviciosRepository.buscarOtroPorSlug(
        slug,
        idServicio
      );

      if (duplicado) {
        throw new ErrorAplicacion("Ya existe un servicio con ese nombre", 409);
      }

      dataActualizacion.slug = slug;
    }

    const servicio = await serviciosRepository.actualizar(
      idServicio,
      dataActualizacion
    );

    return formatearServicio(servicio);
  },

  async desactivar(idServicio: string) {
    const existente = await serviciosRepository.buscarPorId(idServicio);

    if (!existente) {
      throw new ErrorAplicacion("Servicio no encontrado", 404);
    }

    const servicio = await serviciosRepository.desactivar(idServicio);

    return formatearServicio(servicio);
  },

  async listarPublicosBarbero(idBarbero: string) {
    const asignaciones =
      await serviciosRepository.listarServiciosPublicosBarbero(idBarbero);

    return asignaciones.map(formatearServicioBarbero);
  },

  async listarMisServicios(idUsuario: string) {
    const barbero = await serviciosRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignaciones = await serviciosRepository.listarServiciosBarbero(
      barbero.idBarbero
    );

    return asignaciones.map(formatearServicioBarbero);
  },

  async asignar(idUsuario: string, data: AsignarServicioBarberoInput) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    const servicio = await serviciosRepository.buscarActivoPorId(
      data.idServicio
    );

    if (!servicio) {
      throw new ErrorAplicacion("Servicio no encontrado o inactivo", 404);
    }

    const duplicado =
      await serviciosRepository.buscarAsignacionPorBarberoServicio(
        barbero.idBarbero,
        data.idServicio
      );

    if (duplicado) {
      if (duplicado.activo) {
        throw new ErrorAplicacion("El servicio ya está asignado al barbero", 409);
      }

      const reactivada = await serviciosRepository.reactivarAsignacion(
        duplicado.idServicioBarbero,
        data
      );

      return {
        servicio: formatearServicioBarbero(reactivada),
        reactivado: true
      };
    }

    const asignacion = await serviciosRepository.asignar(
      barbero.idBarbero,
      data
    );

    return {
      servicio: formatearServicioBarbero(asignacion),
      reactivado: false
    };
  },

  async actualizarAsignacion(
    idUsuario: string,
    idServicioBarbero: string,
    data: ActualizarServicioBarberoInput
  ) {
    const barbero = await serviciosRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignacion = await serviciosRepository.buscarAsignacion(
      idServicioBarbero
    );

    if (!asignacion) {
      throw new ErrorAplicacion("Servicio del barbero no encontrado", 404);
    }

    if (asignacion.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes modificar este servicio", 403);
    }

    const actualizada = await serviciosRepository.actualizarAsignacion(
      idServicioBarbero,
      data
    );

    return formatearServicioBarbero(actualizada);
  },

  async retirarAsignacion(idUsuario: string, idServicioBarbero: string) {
    const barbero = await serviciosRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignacion = await serviciosRepository.buscarAsignacion(
      idServicioBarbero
    );

    if (!asignacion) {
      throw new ErrorAplicacion("Servicio del barbero no encontrado", 404);
    }

    if (asignacion.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes retirar este servicio", 403);
    }

    const retirada = await serviciosRepository.retirarAsignacion(
      idServicioBarbero
    );

    return formatearServicioBarbero(retirada);
  }
};
