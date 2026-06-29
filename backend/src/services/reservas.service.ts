import { EstadoAprobacion, EstadoCuenta, EstadoReserva, TipoNotificacion } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  reservasRepository,
  type ReservaDetalle
} from "../repositories/reservas.repository";
import { disponibilidadService } from "./disponibilidad.service";
import { esFechaPasadaEnZona, inicioDelDiaEnZona } from "../utils/fechas";
import { calcularHoraFinReserva } from "../utils/reservas";
import { notificacionesInternasService } from "./notificaciones-internas.service";
import type {
  CrearReservaInput,
  FiltrosReservasInput
} from "../validators/reservas.validator";

type UsuarioSesion = {
  idUsuario: string;
  rol: string;
};

const formatearReserva = (reserva: ReservaDetalle) => ({
  idReserva: reserva.idReserva,
  estadoReserva: reserva.estadoReserva,
  fechaReserva: reserva.fechaReserva.toISOString().slice(0, 10),
  horaInicio: reserva.horaInicio,
  horaFin: reserva.horaFin,
  metodoPago: reserva.metodoPago,
  precioServicio: Number(reserva.precioServicio),
  costoTraslado: Number(reserva.costoTraslado),
  total: Number(reserva.total),
  indicacionesCliente: reserva.indicacionesCliente,
  motivoCancelacion: reserva.motivoCancelacion,
  cliente: {
    idCliente: reserva.cliente.idCliente,
    usuario: reserva.cliente.usuario
  },
  barbero: {
    idBarbero: reserva.barbero.idBarbero,
    nombreProfesional: reserva.barbero.nombreProfesional,
    usuario: reserva.barbero.usuario
  },
  servicio: {
    idServicio: reserva.servicio.idServicio,
    nombre: reserva.servicio.nombre
  },
  zonaCobertura: {
    idZonaCobertura: reserva.zonaCobertura.idZonaCobertura,
    nombre: reserva.zonaCobertura.nombre
  },
  historialEstados: reserva.historialEstados.map((historial) => ({
    idHistorialEstadoReserva: historial.idHistorialEstadoReserva,
    estadoAnterior: historial.estadoAnterior,
    estadoNuevo: historial.estadoNuevo,
    comentario: historial.comentario,
    fechaCreacion: historial.fechaCreacion,
    usuarioResponsable: historial.usuarioResponsable
  }))
});

const validarAccesoReserva = (reserva: ReservaDetalle, usuario: UsuarioSesion) => {
  if (usuario.rol === "ADMINISTRADOR") return;
  if (usuario.rol === "CLIENTE" && reserva.cliente.usuario.idUsuario === usuario.idUsuario) return;
  if (usuario.rol === "BARBERO" && reserva.barbero.usuario.idUsuario === usuario.idUsuario) return;

  throw new ErrorAplicacion("No tienes autorización para esta reserva", 403);
};

const obtenerReservaAutorizada = async (
  idReserva: string,
  usuario: UsuarioSesion
) => {
  const reserva = await reservasRepository.buscarPorId(idReserva);

  if (!reserva) {
    throw new ErrorAplicacion("Reserva no encontrada", 404);
  }

  validarAccesoReserva(reserva, usuario);

  return reserva;
};

const validarEstadoActual = (
  reserva: ReservaDetalle,
  estadosPermitidos: EstadoReserva[]
) => {
  if (!estadosPermitidos.includes(reserva.estadoReserva)) {
    throw new ErrorAplicacion("El estado actual no permite esta acción", 409);
  }
};

const cambiarEstado = async (
  idReserva: string,
  usuario: UsuarioSesion,
  estadoNuevo: EstadoReserva,
  estadosPermitidos: EstadoReserva[],
  comentario: string,
  motivoCancelacion?: string
) => {
  const reserva = await obtenerReservaAutorizada(idReserva, usuario);
  validarEstadoActual(reserva, estadosPermitidos);

  if (
    usuario.rol === "BARBERO" &&
    reserva.barbero.usuario.idUsuario !== usuario.idUsuario
  ) {
    throw new ErrorAplicacion("No puedes modificar esta reserva", 403);
  }

  const actualizada = await reservasRepository.cambiarEstado({
    idReserva,
    estadoAnterior: reserva.estadoReserva,
    estadoNuevo,
    idUsuarioResponsable: usuario.idUsuario,
    comentario,
    motivoCancelacion
  });

  await notificarCambioEstadoReserva(actualizada, estadoNuevo);

  return formatearReserva(actualizada);
};

const notificarCambioEstadoReserva = async (
  reserva: ReservaDetalle,
  estadoNuevo: EstadoReserva
) => {
  const metadata = { idReserva: reserva.idReserva, estadoReserva: estadoNuevo };
  const enlaceAccion = `/reservas/${reserva.idReserva}`;

  const notificacionesPorEstado: Partial<
    Record<
      EstadoReserva,
      {
        idUsuario: string;
        tipo: TipoNotificacion;
        titulo: string;
        mensaje: string;
      }[]
    >
  > = {
    [EstadoReserva.CONFIRMADA]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_ACEPTADA,
        titulo: "Reserva aceptada",
        mensaje: "Tu reserva fue aceptada por el barbero."
      }
    ],
    [EstadoReserva.RECHAZADA]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_RECHAZADA,
        titulo: "Reserva rechazada",
        mensaje: "Tu reserva fue rechazada por el barbero."
      }
    ],
    [EstadoReserva.EN_CAMINO]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_EN_CAMINO,
        titulo: "Barbero en camino",
        mensaje: "Tu barbero ya está en camino."
      }
    ],
    [EstadoReserva.EN_SERVICIO]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_INICIADA,
        titulo: "Servicio iniciado",
        mensaje: "Tu servicio de barbería ha iniciado."
      }
    ],
    [EstadoReserva.FINALIZADA]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_FINALIZADA,
        titulo: "Reserva finalizada",
        mensaje: "Tu reserva fue finalizada correctamente."
      }
    ],
    [EstadoReserva.CANCELADA_CLIENTE]: [
      {
        idUsuario: reserva.barbero.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_CANCELADA,
        titulo: "Reserva cancelada",
        mensaje: "El cliente canceló una reserva."
      }
    ],
    [EstadoReserva.CANCELADA_BARBERO]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_CANCELADA,
        titulo: "Reserva cancelada",
        mensaje: "El barbero canceló tu reserva."
      }
    ],
    [EstadoReserva.CANCELADA_ADMINISTRACION]: [
      {
        idUsuario: reserva.cliente.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_CANCELADA,
        titulo: "Reserva cancelada por administración",
        mensaje: "Administración canceló tu reserva."
      },
      {
        idUsuario: reserva.barbero.usuario.idUsuario,
        tipo: TipoNotificacion.RESERVA_CANCELADA,
        titulo: "Reserva cancelada por administración",
        mensaje: "Administración canceló una reserva asignada."
      }
    ]
  };

  await Promise.all(
    (notificacionesPorEstado[estadoNuevo] ?? []).map((notificacion) =>
      notificacionesInternasService.crearNotificacion({
        ...notificacion,
        enlaceAccion,
        metadata
      })
    )
  );
};

export const reservasService = {
  async crearReserva(idUsuario: string, input: CrearReservaInput) {
    if (esFechaPasadaEnZona(input.fechaReserva)) {
      throw new ErrorAplicacion("No se puede reservar una fecha pasada", 422);
    }

    const cliente = await reservasRepository.buscarClientePorUsuario(idUsuario);

    if (!cliente || cliente.usuario.estadoCuenta !== EstadoCuenta.ACTIVO) {
      throw new ErrorAplicacion("Cliente no encontrado o inactivo", 403);
    }

    const barbero = await reservasRepository.buscarBarbero(input.idBarbero);

    if (!barbero) {
      throw new ErrorAplicacion("Barbero no encontrado", 404);
    }

    if (
      barbero.estadoAprobacion !== EstadoAprobacion.APROBADO ||
      barbero.usuario.estadoCuenta !== EstadoCuenta.ACTIVO ||
      !barbero.disponible
    ) {
      throw new ErrorAplicacion("Barbero no disponible", 422);
    }

    const servicioAsignado = await reservasRepository.buscarServicioActivoBarbero(
      input.idBarbero,
      input.idServicio
    );

    if (!servicioAsignado) {
      throw new ErrorAplicacion("Servicio no asignado al barbero", 404);
    }

    const zonaAsignada = await reservasRepository.buscarZonaActivaBarbero(
      input.idBarbero,
      input.idZonaCobertura
    );

    if (!zonaAsignada) {
      throw new ErrorAplicacion("Zona no atendida por el barbero", 404);
    }

    const disponibilidad =
      await disponibilidadService.consultarDisponibilidadPublica(input.idBarbero, {
        fecha: input.fechaReserva,
        idServicio: input.idServicio,
        idZonaCobertura: input.idZonaCobertura
      });

    const horarioDisponible = disponibilidad.horarios.some(
      (horario) => horario.horaInicio === input.horaInicio
    );

    if (!horarioDisponible) {
      throw new ErrorAplicacion("El horario seleccionado no está disponible", 422);
    }

    const duracion =
      servicioAsignado.duracionPersonalizada ??
      servicioAsignado.servicio.duracionMinutos;
    const horaFin = calcularHoraFinReserva(input.horaInicio, duracion);
    const fechaReserva = inicioDelDiaEnZona(input.fechaReserva);

    const cruces = await reservasRepository.buscarReservasActivasEnRango(
      input.idBarbero,
      fechaReserva,
      input.horaInicio,
      horaFin
    );

    if (cruces.length > 0) {
      throw new ErrorAplicacion("El barbero ya tiene una reserva en ese horario", 409);
    }

    const precioServicio = Number(
      servicioAsignado.precioPersonalizado ?? servicioAsignado.servicio.precioBase
    );
    const costoTraslado = Number(zonaAsignada.costoTraslado ?? 0);
    const total = precioServicio + costoTraslado;

    const reserva = await reservasRepository.crearReservaConHistorial({
      clienteId: cliente.idCliente,
      usuarioResponsableId: idUsuario,
      input,
      fechaReserva,
      horaFin,
      precioServicio,
      costoTraslado,
      total
    });

    await notificacionesInternasService.crearNotificacion({
      idUsuario: reserva.barbero.usuario.idUsuario,
      tipo: TipoNotificacion.RESERVA_CREADA,
      titulo: "Nueva reserva recibida",
      mensaje: "Tienes una nueva reserva pendiente de confirmación.",
      enlaceAccion: `/reservas/${reserva.idReserva}`,
      metadata: { idReserva: reserva.idReserva }
    });

    return formatearReserva(reserva);
  },

  async listarMisReservasCliente(idUsuario: string, filtros: FiltrosReservasInput) {
    const cliente = await reservasRepository.buscarClientePorUsuario(idUsuario);
    if (!cliente) throw new ErrorAplicacion("Cliente no encontrado", 404);

    return this.listarConFiltro(filtros, { idCliente: cliente.idCliente });
  },

  async listarMisServiciosBarbero(idUsuario: string, filtros: FiltrosReservasInput) {
    const barbero = await reservasRepository.buscarBarberoPorUsuario(idUsuario);
    if (!barbero) throw new ErrorAplicacion("Barbero no encontrado", 404);

    return this.listarConFiltro(filtros, { idBarbero: barbero.idBarbero });
  },

  async listarTodas(filtros: FiltrosReservasInput) {
    return this.listarConFiltro(filtros);
  },

  async listarConFiltro(filtros: FiltrosReservasInput, extraWhere = {}) {
    const { reservas, totalRegistros } = await reservasRepository.listar(
      filtros,
      extraWhere
    );
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: reservas.map(formatearReserva),
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

  async obtenerDetalle(idReserva: string, usuario: UsuarioSesion) {
    const reserva = await obtenerReservaAutorizada(idReserva, usuario);
    return formatearReserva(reserva);
  },

  async obtenerHistorial(idReserva: string, usuario: UsuarioSesion) {
    const reserva = await obtenerReservaAutorizada(idReserva, usuario);
    return formatearReserva(reserva).historialEstados;
  },

  aceptar(idReserva: string, usuario: UsuarioSesion) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.CONFIRMADA,
      [EstadoReserva.PENDIENTE],
      "Reserva aceptada"
    );
  },

  rechazar(idReserva: string, usuario: UsuarioSesion, motivo: string) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.RECHAZADA,
      [EstadoReserva.PENDIENTE],
      "Reserva rechazada",
      motivo
    );
  },

  enCamino(idReserva: string, usuario: UsuarioSesion) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.EN_CAMINO,
      [EstadoReserva.CONFIRMADA],
      "Barbero en camino"
    );
  },

  iniciarServicio(idReserva: string, usuario: UsuarioSesion) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.EN_SERVICIO,
      [EstadoReserva.EN_CAMINO],
      "Servicio iniciado"
    );
  },

  finalizar(idReserva: string, usuario: UsuarioSesion) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.FINALIZADA,
      [EstadoReserva.EN_SERVICIO],
      "Servicio finalizado"
    );
  },

  cancelarCliente(idReserva: string, usuario: UsuarioSesion, motivo?: string) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.CANCELADA_CLIENTE,
      [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA],
      "Reserva cancelada por cliente",
      motivo
    );
  },

  cancelarBarbero(idReserva: string, usuario: UsuarioSesion, motivo: string) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.CANCELADA_BARBERO,
      [
        EstadoReserva.PENDIENTE,
        EstadoReserva.CONFIRMADA,
        EstadoReserva.EN_CAMINO,
        EstadoReserva.EN_SERVICIO,
        EstadoReserva.CANCELADA_CLIENTE,
        EstadoReserva.CANCELADA_BARBERO,
        EstadoReserva.CANCELADA_ADMINISTRACION,
        EstadoReserva.RECHAZADA
      ],
      "Reserva cancelada por barbero",
      motivo
    );
  },

  cancelarAdministracion(
    idReserva: string,
    usuario: UsuarioSesion,
    motivo: string
  ) {
    return cambiarEstado(
      idReserva,
      usuario,
      EstadoReserva.CANCELADA_ADMINISTRACION,
      [
        EstadoReserva.PENDIENTE,
        EstadoReserva.CONFIRMADA,
        EstadoReserva.EN_CAMINO,
        EstadoReserva.EN_SERVICIO,
        EstadoReserva.CANCELADA_CLIENTE,
        EstadoReserva.CANCELADA_BARBERO,
        EstadoReserva.CANCELADA_ADMINISTRACION,
        EstadoReserva.RECHAZADA
      ],
      "Reserva cancelada por administración",
      motivo
    );
  }
};
