import { EstadoAprobacion, EstadoCuenta } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  especialidadesRepository,
  type EspecialidadBarberoDetalle,
  type EspecialidadCatalogo
} from "../repositories/especialidades.repository";
import { generarSlug } from "../utils/slug";
import type {
  ActualizarEspecialidadInput,
  AsignarEspecialidadInput,
  CrearEspecialidadInput,
  FiltrosEspecialidadesInput
} from "../validators/especialidades.validator";

const formatearEspecialidad = (especialidad: EspecialidadCatalogo) => ({
  idEspecialidad: especialidad.idEspecialidad,
  nombre: especialidad.nombre,
  slug: especialidad.slug,
  descripcion: especialidad.descripcion,
  activa: especialidad.activa,
  fechaCreacion: especialidad.fechaCreacion,
  fechaActualizacion: especialidad.fechaActualizacion
});

const formatearEspecialidadBarbero = (
  asignacion: EspecialidadBarberoDetalle
) => ({
  idEspecialidadBarbero: asignacion.idEspecialidadBarbero,
  idBarbero: asignacion.idBarbero,
  idEspecialidad: asignacion.idEspecialidad,
  fechaCreacion: asignacion.fechaCreacion,
  especialidad: formatearEspecialidad(asignacion.especialidad)
});

const obtenerBarberoAprobado = async (idUsuario: string) => {
  const barbero =
    await especialidadesRepository.buscarBarberoPorUsuario(idUsuario);

  if (!barbero) {
    throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
  }

  if (barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del barbero no está activa", 403);
  }

  if (barbero.estadoAprobacion !== EstadoAprobacion.APROBADO) {
    throw new ErrorAplicacion(
      "Solo barberos aprobados pueden administrar especialidades",
      403
    );
  }

  return barbero;
};

export const especialidadesService = {
  async listar(filtros: FiltrosEspecialidadesInput) {
    const { especialidades, totalRegistros } =
      await especialidadesRepository.listar(filtros);
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: especialidades.map(formatearEspecialidad),
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

  async crear(data: CrearEspecialidadInput) {
    const slug = generarSlug(data.nombre);
    const duplicado = await especialidadesRepository.buscarPorSlug(slug);

    if (duplicado) {
      throw new ErrorAplicacion("Ya existe una especialidad con ese nombre", 409);
    }

    const especialidad = await especialidadesRepository.crear({
      ...data,
      slug
    });

    return formatearEspecialidad(especialidad);
  },

  async actualizar(
    idEspecialidad: string,
    data: ActualizarEspecialidadInput
  ) {
    const existente = await especialidadesRepository.buscarPorId(idEspecialidad);

    if (!existente) {
      throw new ErrorAplicacion("Especialidad no encontrada", 404);
    }

    const dataActualizacion: ActualizarEspecialidadInput & { slug?: string } = {
      ...data
    };

    if (data.nombre) {
      const slug = generarSlug(data.nombre);
      const duplicado = await especialidadesRepository.buscarOtraPorSlug(
        slug,
        idEspecialidad
      );

      if (duplicado) {
        throw new ErrorAplicacion(
          "Ya existe una especialidad con ese nombre",
          409
        );
      }

      dataActualizacion.slug = slug;
    }

    const especialidad = await especialidadesRepository.actualizar(
      idEspecialidad,
      dataActualizacion
    );

    return formatearEspecialidad(especialidad);
  },

  async desactivar(idEspecialidad: string) {
    const existente = await especialidadesRepository.buscarPorId(idEspecialidad);

    if (!existente) {
      throw new ErrorAplicacion("Especialidad no encontrada", 404);
    }

    const especialidad =
      await especialidadesRepository.desactivar(idEspecialidad);

    return formatearEspecialidad(especialidad);
  },

  async listarPublicasBarbero(idBarbero: string) {
    const asignaciones =
      await especialidadesRepository.listarPublicasBarbero(idBarbero);

    return asignaciones.map(formatearEspecialidadBarbero);
  },

  async listarMisEspecialidades(idUsuario: string) {
    const barbero =
      await especialidadesRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignaciones = await especialidadesRepository.listarBarbero(
      barbero.idBarbero
    );

    return asignaciones.map(formatearEspecialidadBarbero);
  },

  async asignar(idUsuario: string, data: AsignarEspecialidadInput) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    const especialidad = await especialidadesRepository.buscarActivaPorId(
      data.idEspecialidad
    );

    if (!especialidad) {
      throw new ErrorAplicacion("Especialidad no encontrada o inactiva", 404);
    }

    const duplicada =
      await especialidadesRepository.buscarAsignacionPorBarberoEspecialidad(
        barbero.idBarbero,
        data.idEspecialidad
      );

    if (duplicada) {
      throw new ErrorAplicacion(
        "La especialidad ya está asignada al barbero",
        409
      );
    }

    const asignacion = await especialidadesRepository.asignar(
      barbero.idBarbero,
      data
    );

    return formatearEspecialidadBarbero(asignacion);
  },

  async retirar(idUsuario: string, idEspecialidadBarbero: string) {
    const barbero =
      await especialidadesRepository.buscarBarberoPorUsuario(idUsuario);

    if (!barbero) {
      throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
    }

    const asignacion = await especialidadesRepository.buscarAsignacion(
      idEspecialidadBarbero
    );

    if (!asignacion) {
      throw new ErrorAplicacion("Especialidad del barbero no encontrada", 404);
    }

    if (asignacion.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes retirar esta especialidad", 403);
    }

    const retirada = await especialidadesRepository.retirar(
      idEspecialidadBarbero
    );

    return formatearEspecialidadBarbero(retirada);
  }
};
