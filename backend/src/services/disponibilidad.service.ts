import { DiaSemana, EstadoAprobacion, EstadoCuenta } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  disponibilidadRepository,
  type BloqueoHorarioDetalle,
  type HorarioDisponibilidadDetalle
} from "../repositories/disponibilidad.repository";
import {
  crearFechaHoraEnZona,
  esFechaPasadaEnZona,
  fechaConsultaADiaSemana,
  finDelDiaEnZona,
  inicioDelDiaEnZona
} from "../utils/fechas";
import {
  haySuperposicion,
  horaDesdeMinutos,
  minutosDesdeHora
} from "../utils/horarios";
import type {
  ActualizarBloqueoInput,
  ActualizarHorarioInput,
  ConsultaDisponibilidadInput,
  CrearBloqueoInput,
  CrearHorarioInput,
  FiltrosBloqueosInput
} from "../validators/disponibilidad.validator";

const ordenDias: Record<DiaSemana, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 7
};

const formatearHorario = (horario: HorarioDisponibilidadDetalle) => ({
  idHorarioDisponibilidad: horario.idHorarioDisponibilidad,
  diaSemana: horario.diaSemana,
  horaInicio: horario.horaInicio,
  horaFin: horario.horaFin,
  activo: horario.activo,
  fechaCreacion: horario.fechaCreacion,
  fechaActualizacion: horario.fechaActualizacion
});

const formatearBloqueo = (bloqueo: BloqueoHorarioDetalle) => ({
  idBloqueoHorario: bloqueo.idBloqueoHorario,
  fechaInicio: bloqueo.fechaInicio,
  fechaFin: bloqueo.fechaFin,
  motivo: bloqueo.motivo,
  activo: bloqueo.activo,
  fechaCreacion: bloqueo.fechaCreacion,
  fechaActualizacion: bloqueo.fechaActualizacion
});

const obtenerBarberoPropio = async (idUsuario: string) => {
  const barbero =
    await disponibilidadRepository.buscarBarberoPorUsuario(idUsuario);

  if (!barbero) {
    throw new ErrorAplicacion("Perfil de barbero no encontrado", 404);
  }

  return barbero;
};

const obtenerBarberoAprobado = async (idUsuario: string) => {
  const barbero = await obtenerBarberoPropio(idUsuario);

  if (barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
    throw new ErrorAplicacion("La cuenta del barbero no está activa", 403);
  }

  if (barbero.estadoAprobacion !== EstadoAprobacion.APROBADO) {
    throw new ErrorAplicacion(
      "Solo barberos aprobados pueden administrar disponibilidad",
      403
    );
  }

  return barbero;
};

const validarSuperposicionHorarios = async (
  idBarbero: string,
  diaSemana: DiaSemana,
  horaInicio: string,
  horaFin: string,
  idHorarioDisponibilidad?: string
) => {
  const horarios =
    await disponibilidadRepository.listarHorariosActivosDelDiaExcluyendo(
      idBarbero,
      diaSemana,
      idHorarioDisponibilidad
    );
  const inicio = minutosDesdeHora(horaInicio);
  const fin = minutosDesdeHora(horaFin);

  const seCruza = horarios.some((horario) =>
    haySuperposicion(
      inicio,
      fin,
      minutosDesdeHora(horario.horaInicio),
      minutosDesdeHora(horario.horaFin)
    )
  );

  if (seCruza) {
    throw new ErrorAplicacion(
      "El horario se superpone con otro horario activo",
      409
    );
  }
};

const validarSuperposicionBloqueos = async (
  idBarbero: string,
  fechaInicio: Date,
  fechaFin: Date,
  idBloqueoHorario?: string
) => {
  const bloqueos =
    await disponibilidadRepository.listarBloqueosActivosEnRango(
      idBarbero,
      fechaInicio,
      fechaFin,
      idBloqueoHorario
    );

  if (bloqueos.length > 0) {
    throw new ErrorAplicacion(
      "El bloqueo se superpone con otro bloqueo activo",
      409
    );
  }
};

export const disponibilidadService = {
  async listarMisHorarios(idUsuario: string) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const horarios = await disponibilidadRepository.listarHorarios(
      barbero.idBarbero
    );

    return horarios
      .sort(
        (a, b) =>
          ordenDias[a.diaSemana] - ordenDias[b.diaSemana] ||
          a.horaInicio.localeCompare(b.horaInicio)
      )
      .map(formatearHorario);
  },

  async crearHorario(idUsuario: string, data: CrearHorarioInput) {
    const barbero = await obtenerBarberoAprobado(idUsuario);

    await validarSuperposicionHorarios(
      barbero.idBarbero,
      data.diaSemana,
      data.horaInicio,
      data.horaFin
    );

    const horario = await disponibilidadRepository.crearHorario(
      barbero.idBarbero,
      data
    );

    return formatearHorario(horario);
  },

  async actualizarHorario(
    idUsuario: string,
    idHorarioDisponibilidad: string,
    data: ActualizarHorarioInput
  ) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const horario = await disponibilidadRepository.buscarHorario(
      idHorarioDisponibilidad
    );

    if (!horario) {
      throw new ErrorAplicacion("Horario no encontrado", 404);
    }

    if (horario.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes modificar este horario", 403);
    }

    const diaSemana = data.diaSemana ?? horario.diaSemana;
    const horaInicio = data.horaInicio ?? horario.horaInicio;
    const horaFin = data.horaFin ?? horario.horaFin;

    if (minutosDesdeHora(horaInicio) >= minutosDesdeHora(horaFin)) {
      throw new ErrorAplicacion("horaInicio debe ser menor que horaFin", 400);
    }

    if (data.activo ?? horario.activo) {
      await validarSuperposicionHorarios(
        barbero.idBarbero,
        diaSemana,
        horaInicio,
        horaFin,
        idHorarioDisponibilidad
      );
    }

    const actualizado = await disponibilidadRepository.actualizarHorario(
      idHorarioDisponibilidad,
      data
    );

    return formatearHorario(actualizado);
  },

  async desactivarHorario(idUsuario: string, idHorarioDisponibilidad: string) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const horario = await disponibilidadRepository.buscarHorario(
      idHorarioDisponibilidad
    );

    if (!horario) {
      throw new ErrorAplicacion("Horario no encontrado", 404);
    }

    if (horario.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes eliminar este horario", 403);
    }

    const desactivado = await disponibilidadRepository.desactivarHorario(
      idHorarioDisponibilidad
    );

    return formatearHorario(desactivado);
  },

  async reactivarHorario(idUsuario: string, idHorarioDisponibilidad: string) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    const horario = await disponibilidadRepository.buscarHorario(
      idHorarioDisponibilidad
    );

    if (!horario) {
      throw new ErrorAplicacion("Horario no encontrado", 404);
    }

    if (horario.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes reactivar este horario", 403);
    }

    if (horario.activo) {
      throw new ErrorAplicacion("El horario ya se encuentra activo.", 409);
    }

    try {
      await validarSuperposicionHorarios(
        barbero.idBarbero,
        horario.diaSemana,
        horario.horaInicio,
        horario.horaFin,
        idHorarioDisponibilidad
      );
    } catch (error) {
      if (
        error instanceof ErrorAplicacion &&
        error.message.includes("superpone")
      ) {
        throw new ErrorAplicacion(
          "No se puede reactivar porque se cruza con un horario activo.",
          409
        );
      }
      throw error;
    }

    const reactivado = await disponibilidadRepository.reactivarHorario(
      idHorarioDisponibilidad
    );

    return formatearHorario(reactivado);
  },

  async listarMisBloqueos(idUsuario: string, filtros: FiltrosBloqueosInput) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const { bloqueos, totalRegistros } =
      await disponibilidadRepository.listarBloqueos(barbero.idBarbero, filtros);
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: bloqueos.map(formatearBloqueo),
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

  async crearBloqueo(idUsuario: string, data: CrearBloqueoInput) {
    const barbero = await obtenerBarberoAprobado(idUsuario);
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (fechaFin <= new Date()) {
      throw new ErrorAplicacion(
        "No se puede crear un bloqueo completamente pasado",
        422
      );
    }

    await validarSuperposicionBloqueos(
      barbero.idBarbero,
      fechaInicio,
      fechaFin
    );

    const bloqueo = await disponibilidadRepository.crearBloqueo(
      barbero.idBarbero,
      data
    );

    return formatearBloqueo(bloqueo);
  },

  async actualizarBloqueo(
    idUsuario: string,
    idBloqueoHorario: string,
    data: ActualizarBloqueoInput
  ) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const bloqueo = await disponibilidadRepository.buscarBloqueo(
      idBloqueoHorario
    );

    if (!bloqueo) {
      throw new ErrorAplicacion("Bloqueo no encontrado", 404);
    }

    if (bloqueo.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes modificar este bloqueo", 403);
    }

    const fechaInicio = data.fechaInicio
      ? new Date(data.fechaInicio)
      : bloqueo.fechaInicio;
    const fechaFin = data.fechaFin ? new Date(data.fechaFin) : bloqueo.fechaFin;

    if (fechaInicio >= fechaFin) {
      throw new ErrorAplicacion(
        "fechaInicio debe ser anterior a fechaFin",
        400
      );
    }

    if (data.activo !== false && (data.activo === true || bloqueo.activo)) {
      await validarSuperposicionBloqueos(
        barbero.idBarbero,
        fechaInicio,
        fechaFin,
        idBloqueoHorario
      );
    }

    const actualizado = await disponibilidadRepository.actualizarBloqueo(
      idBloqueoHorario,
      data
    );

    return formatearBloqueo(actualizado);
  },

  async desactivarBloqueo(idUsuario: string, idBloqueoHorario: string) {
    const barbero = await obtenerBarberoPropio(idUsuario);
    const bloqueo = await disponibilidadRepository.buscarBloqueo(
      idBloqueoHorario
    );

    if (!bloqueo) {
      throw new ErrorAplicacion("Bloqueo no encontrado", 404);
    }

    if (bloqueo.idBarbero !== barbero.idBarbero) {
      throw new ErrorAplicacion("No puedes eliminar este bloqueo", 403);
    }

    const desactivado = await disponibilidadRepository.desactivarBloqueo(
      idBloqueoHorario
    );

    return formatearBloqueo(desactivado);
  },

  async consultarDisponibilidadPublica(
    idBarbero: string,
    query: ConsultaDisponibilidadInput
  ) {
    if (esFechaPasadaEnZona(query.fecha)) {
      throw new ErrorAplicacion("No se puede consultar una fecha pasada", 422);
    }

    const barbero = await disponibilidadRepository.buscarBarberoPublico(
      idBarbero
    );

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    if (
      barbero.estadoAprobacion !== EstadoAprobacion.APROBADO ||
      barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO ||
      !barbero.disponible
    ) {
      throw new ErrorAplicacion("Barbero no disponible públicamente", 404);
    }

    const servicioAsignado =
      await disponibilidadRepository.buscarServicioActivoBarbero(
        idBarbero,
        query.idServicio
      );

    if (!servicioAsignado) {
      throw new ErrorAplicacion(
        "El barbero no ofrece el servicio indicado",
        404
      );
    }

    const zonaAsignada =
      await disponibilidadRepository.buscarZonaActivaBarbero(
        idBarbero,
        query.idZonaCobertura
      );

    if (!zonaAsignada) {
      throw new ErrorAplicacion("El barbero no atiende la zona indicada", 404);
    }

    const diaSemana = fechaConsultaADiaSemana(query.fecha);
    const horarios =
      await disponibilidadRepository.listarHorariosActivosPorDia(
        idBarbero,
        diaSemana
      );
    const bloqueos =
      await disponibilidadRepository.listarBloqueosActivosEnRango(
        idBarbero,
        inicioDelDiaEnZona(query.fecha),
        finDelDiaEnZona(query.fecha)
      );

    const duracionMinutos =
      servicioAsignado.duracionPersonalizada ??
      servicioAsignado.servicio.duracionMinutos;
    const tiempoTrasladoMinutos = zonaAsignada.tiempoTrasladoMinutos ?? 0;
    const horariosDisponibles: Array<{
      horaInicio: string;
      horaFin: string;
    }> = [];

    for (const horario of horarios) {
      const inicioHorario = minutosDesdeHora(horario.horaInicio);
      const finHorario = minutosDesdeHora(horario.horaFin);

      for (
        let inicio = inicioHorario;
        inicio + duracionMinutos <= finHorario;
        inicio += 30
      ) {
        const finServicio = inicio + duracionMinutos;
        const inicioFecha = crearFechaHoraEnZona(
          query.fecha,
          horaDesdeMinutos(inicio)
        );
        const finFechaConTraslado = new Date(
          inicioFecha.getTime() +
            (duracionMinutos + tiempoTrasladoMinutos) * 60 * 1000
        );

        const cruzaBloqueo = bloqueos.some(
          (bloqueo) =>
            inicioFecha < bloqueo.fechaFin &&
            finFechaConTraslado > bloqueo.fechaInicio
        );

        if (!cruzaBloqueo) {
          horariosDisponibles.push({
            horaInicio: horaDesdeMinutos(inicio),
            horaFin: horaDesdeMinutos(finServicio)
          });
        }
      }
    }

    return {
      fecha: query.fecha,
      barbero: {
        idBarbero: barbero.idBarbero,
        nombreProfesional: barbero.nombreProfesional
      },
      servicio: {
        idServicio: servicioAsignado.servicio.idServicio,
        nombre: servicioAsignado.servicio.nombre,
        duracionMinutos
      },
      zona: {
        idZonaCobertura: zonaAsignada.zonaCobertura.idZonaCobertura,
        nombre: zonaAsignada.zonaCobertura.nombre,
        tiempoTrasladoMinutos
      },
      horarios: horariosDisponibles
    };
  }
};
