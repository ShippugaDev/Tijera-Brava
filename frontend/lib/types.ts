export type RolUsuario = "ADMINISTRADOR" | "CLIENTE" | "BARBERO";

export interface UsuarioSesion {
  idUsuario: string;
  nombres: string;
  apellidos?: string;
  correo?: string;
  telefono?: string | null;
  fotoPerfilUrl?: string | null;
  rol: RolUsuario;
}

export interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

export interface DashboardAdministracion {
  usuarios: {
    totalUsuarios: number;
    totalClientes: number;
    totalBarberos: number;
    totalAdministradores: number;
    usuariosActivos: number;
    usuariosSuspendidos: number;
  };
  barberos: {
    aprobados: number;
    pendientes: number;
    rechazados: number;
  };
  reservas: {
    totalReservas: number;
    pendientes: number;
    confirmadas: number;
    finalizadas: number;
    canceladas: number;
    rechazadas: number;
  };
  pagos: {
    totalPagos: number;
    pendientes: number;
    comprobantesSubidos: number;
    confirmados: number;
    cancelados: number;
    reembolsados: number;
    montoTotalConfirmado: number;
  };
  lookia: {
    totalSimulaciones: number;
    completadas: number;
    fallidas: number;
    eliminadas: number;
  };
  notificaciones: {
    totalNotificaciones: number;
    noLeidas: number;
  };
}

export interface ReservaEstadistica {
  estadoReserva?: string;
  periodo?: string;
  total: number;
}

export interface ServicioEstadistica {
  idServicio?: string;
  nombre: string;
  totalReservas?: number;
  totalFinalizadas?: number;
  montoGenerado?: number;
  totalIngresos?: number;
}

export interface BarberoEstadistica {
  idBarbero?: string;
  nombreProfesional: string;
  estadoAprobacion?: string;
  estado?: string;
  totalReservas?: number;
  reservasFinalizadas?: number;
  promedioCalificacion?: number;
  calificacionPromedio?: number;
  totalCalificaciones?: number;
  montoGenerado?: number;
  totalPortafolios?: number;
}

export interface ResultadoLookIAEstadistica {
  estadoSimulacion?: string;
  total: number;
  estilo?: {
    idEstiloLookIA?: string;
    nombre?: string;
  };
  categoria?: {
    idCategoriaCorte?: string;
    nombre?: string;
  } | null;
  periodo?: string;
}

export interface LookIAEstadistica {
  resumen?: {
    totalSimulaciones?: number;
    completadas?: number;
    fallidas?: number;
    eliminadas?: number;
  };
  resultados?: ResultadoLookIAEstadistica[];
}

export interface PagoEstadistica {
  estadoPago?: string;
  metodoPago?: string;
  periodo?: string;
  total: number;
  montoTotal?: number;
}

export interface PagosEstadistica {
  resumen?: {
    totalPagos?: number;
    montoTotal?: number;
    montoConfirmado?: number;
    montoReembolsado?: number;
  };
  resultados?: PagoEstadistica[];
}

export interface Paginacion {
  pagina: number;
  limite: number;
  totalRegistros: number;
  totalPaginas: number;
  tieneSiguiente: boolean;
  tieneAnterior: boolean;
}

export type EstadoCuentaUsuario = "PENDIENTE" | "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | string;

export interface UsuarioAdmin {
  idUsuario: string;
  nombres: string;
  apellidos?: string | null;
  correo: string;
  telefono?: string | null;
  fotoPerfilUrl?: string | null;
  rol: RolUsuario | string;
  estadoCuenta?: EstadoCuentaUsuario;
  fechaCreacion?: string;
  cliente?: unknown;
  barbero?: BarberoAdmin | null;
}

export interface BarberoAdmin {
  idBarbero?: string;
  idUsuario?: string;
  nombreProfesional?: string | null;
  biografia?: string | null;
  anosExperiencia?: number;
  aniosExperiencia?: number;
  estadoAprobacion?: string;
  disponible?: boolean;
  fechaCreacion?: string;
  usuario?: UsuarioAdmin;
}

export interface BarberoPendienteAdmin {
  idBarbero: string;
  idUsuario: string;
  nombres: string;
  apellidos?: string | null;
  correo: string;
  telefono?: string | null;
  nombreProfesional?: string | null;
  biografia?: string | null;
  anosExperiencia?: number;
  aniosExperiencia?: number;
  especialidades?: string[];
  estadoAprobacion?: string;
  fechaCreacion?: string;
}

export interface BarberoPublico {
  idBarbero: string;
  idUsuario?: string;
  nombreProfesional: string;
  biografia?: string | null;
  anosExperiencia?: number;
  aniosExperiencia?: number;
  calificacionPromedio?: number;
  disponible?: boolean;
  estadoAprobacion?: string;
  fotoPerfilUrl?: string | null;
  fotografiaUrl?: string | null;
  imagenPerfilUrl?: string | null;
  urlFoto?: string | null;
  avatarUrl?: string | null;
  usuario?: {
    nombres?: string | null;
    apellidos?: string | null;
    fotoPerfilUrl?: string | null;
    fotografiaUrl?: string | null;
    imagenPerfilUrl?: string | null;
    urlFoto?: string | null;
    avatarUrl?: string | null;
  };
  especialidades?: string[];
}

export interface ServicioBarbero {
  idServicioBarbero?: string;
  idBarbero?: string;
  idServicio: string;
  servicio?: {
    idServicio: string;
    nombre: string;
    slug?: string;
    descripcion?: string | null;
    precioBase?: number;
    duracionMinutos?: number;
  };
  nombre?: string;
  precioPersonalizado?: number | null;
  precioFinal?: number;
  duracionPersonalizada?: number | null;
  duracionFinal?: number;
}

export interface ZonaBarbero {
  idZonaBarbero?: string;
  idBarbero?: string;
  idZonaCobertura: string;
  costoTraslado?: number | null;
  tiempoTrasladoMinutos?: number | null;
  zonaCobertura?: {
    idZonaCobertura: string;
    nombre: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
  };
  nombre?: string;
  distrito?: string;
}

export interface HorarioDisponible {
  horaInicio: string;
  horaFin: string;
}

export interface ReservaCliente {
  idReserva: string;
  estadoReserva: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin?: string;
  metodoPago?: string;
  total?: number;
  indicacionesCliente?: string | null;
  motivoCancelacion?: string | null;
  barbero?: {
    idBarbero: string;
    nombreProfesional?: string;
    usuario?: {
      nombres?: string;
      apellidos?: string;
    };
  };
  servicio?: {
    idServicio: string;
    nombre: string;
  };
  zonaCobertura?: {
    idZonaCobertura: string;
    nombre: string;
  };
  pago?: PagoCliente | null;
}

export interface DisponibilidadBarbero {
  fecha: string;
  horarios: HorarioDisponible[];
}

export interface CategoriaLookIA {
  idCategoriaCorte?: string;
  nombre: string;
  slug?: string;
}

export interface EstiloLookIA {
  idEstiloLookIA: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  promptBase?: string;
  imagenReferenciaUrl?: string | null;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  categoria?: CategoriaLookIA | string | null;
}

export type EstadoSimulacionLookIA = "PROCESANDO" | "COMPLETADA" | "FALLIDA" | "ELIMINADA" | string;

export interface SimulacionLookIA {
  idSimulacionLookIA: string;
  idEstiloLookIA?: string;
  estadoSimulacion: EstadoSimulacionLookIA;
  imagenOriginalUrl?: string | null;
  imagenResultadoUrl?: string | null;
  imagenGeneradaUrl?: string | null;
  resultadoTexto?: string | null;
  mensajeError?: string | null;
  consentimientoAceptado?: boolean;
  fechaProcesamiento?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  estilo?: EstiloLookIA | null;
}

export interface BarberoRecomendado {
  idBarbero: string;
  nombreProfesional: string;
  biografia?: string | null;
  especialidad?: string | null;
  anosExperiencia?: number;
  aniosExperiencia?: number;
  promedioCalificacion?: number;
  calificacionPromedio?: number;
  totalCalificaciones?: number;
  cantidadPortafolios?: number;
  publicacionesDestacadas?: unknown[];
}

export type EstadoPago =
  | "PENDIENTE"
  | "COMPROBANTE_SUBIDO"
  | "CONFIRMADO"
  | "CANCELADO"
  | "REEMBOLSADO"
  | string;

export interface PagoCliente {
  idPago: string;
  idReserva: string;
  estadoPago: EstadoPago;
  metodoPago?: string;
  montoServicio?: number;
  montoTraslado?: number;
  montoTotal?: number;
  comprobanteUrl?: string | null;
  codigoOperacion?: string | null;
  observacion?: string | null;
  fechaConfirmacion?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  reserva?: ReservaCliente;
}

export interface HistorialPago {
  idHistorialPago?: string;
  idHistorialEstadoPago?: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  observacion?: string | null;
  comentario?: string | null;
  fechaCreacion?: string;
  usuarioResponsable?: {
    idUsuario?: string;
    nombres?: string;
    apellidos?: string;
    correo?: string;
  } | null;
}

export interface CalificacionCliente {
  idCalificacion: string;
  idReserva: string;
  puntuacion: number;
  comentario?: string | null;
  estadoVisibilidad?: string;
  motivoModeracion?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  cliente?: {
    idCliente?: string;
    nombres?: string;
    apellidos?: string;
  };
  barbero?: {
    idBarbero?: string;
    nombres?: string;
    apellidos?: string;
    nombreProfesional?: string;
  };
  reserva?: Partial<ReservaCliente> | null;
}

export interface NuevaCalificacionPayload {
  idReserva: string;
  puntuacion: number;
  comentario?: string;
}

export type EstadoReserva =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "EN_CAMINO"
  | "EN_SERVICIO"
  | "FINALIZADA"
  | "CANCELADA"
  | "CANCELADA_CLIENTE"
  | "CANCELADA_BARBERO"
  | "CANCELADA_ADMINISTRACION"
  | "RECHAZADA"
  | string;

export interface HistorialReserva {
  idHistorialEstadoReserva?: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  comentario?: string | null;
  motivo?: string | null;
  fechaCreacion?: string;
  usuarioResponsable?: {
    idUsuario?: string;
    nombres?: string;
    apellidos?: string;
    correo?: string;
  } | null;
}

export interface ReservaBarbero {
  idReserva: string;
  estadoReserva: EstadoReserva;
  fechaReserva: string;
  horaInicio: string;
  horaFin?: string;
  metodoPago?: string;
  precioServicio?: number;
  costoTraslado?: number;
  total?: number;
  indicacionesCliente?: string | null;
  motivoCancelacion?: string | null;
  cliente?: {
    idCliente?: string;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
    usuario?: {
      nombres?: string;
      apellidos?: string;
      telefono?: string;
      correo?: string;
    };
  };
  servicio?: {
    idServicio?: string;
    nombre?: string;
  };
  zonaCobertura?: {
    idZonaCobertura?: string;
    nombre?: string;
    distrito?: string;
  };
  pago?: PagoCliente | null;
  historialEstados?: HistorialReserva[];
}

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export interface HorarioDisponibilidad {
  idHorarioDisponibilidad: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface BloqueoHorario {
  idBloqueoHorario: string;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string | null;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ServicioCatalogo {
  idServicio: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  precioBase?: number;
  duracionMinutos?: number;
  duracionBase?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ServicioAdmin {
  idServicio: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  precioBase: number;
  duracionMinutos: number;
  duracionBase?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CategoriaCorteAdmin {
  idCategoriaCorte: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  activa?: boolean;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ZonaCoberturaAdmin {
  idZonaCobertura: string;
  nombre: string;
  slug?: string;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  descripcion?: string | null;
  costoTraslado?: number | null;
  activa?: boolean;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export type EstadoVisibilidadPortafolioModeracion = "VISIBLE" | "OCULTO" | "ELIMINADO" | string;
export type EstadoVisibilidadCalificacionModeracion = "VISIBLE" | "OCULTA" | string;

export interface PortafolioModeracion {
  idPortafolioCorte: string;
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  destacado?: boolean;
  estadoVisibilidad?: EstadoVisibilidadPortafolioModeracion;
  motivoModeracion?: string | null;
  fechaCreacion?: string;
  categoriaCorte?: {
    idCategoriaCorte?: string;
    nombre?: string;
  } | null;
  categoria?: {
    nombre?: string;
  } | null;
  barbero?: {
    idBarbero?: string;
    nombreProfesional?: string;
    usuario?: {
      nombres?: string;
      apellidos?: string;
      correo?: string;
    };
  };
}

export interface CalificacionModeracion {
  idCalificacion: string;
  puntuacion: number;
  comentario?: string | null;
  estadoVisibilidad?: EstadoVisibilidadCalificacionModeracion;
  motivoModeracion?: string | null;
  fechaCreacion?: string;
  cliente?: {
    usuario?: {
      nombres?: string;
      apellidos?: string;
      correo?: string;
    };
  };
  barbero?: {
    idBarbero?: string;
    nombreProfesional?: string;
    usuario?: {
      nombres?: string;
      apellidos?: string;
      correo?: string;
    };
  };
  reserva?: {
    idReserva?: string;
    fechaReserva?: string;
    servicio?: {
      idServicio?: string;
      nombre?: string;
    };
  };
}

export interface ServicioBarberoAsignado {
  idServicioBarbero: string;
  idBarbero?: string;
  idServicio: string;
  precioPersonalizado?: number | null;
  precioFinal?: number;
  duracionPersonalizada?: number | null;
  duracionFinal?: number;
  activo?: boolean;
  estaActivo?: boolean;
  estado?: string;
  estadoAsignacion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  servicio?: ServicioCatalogo;
}

export interface CategoriaCorte {
  idCategoriaCorte: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  activo?: boolean;
  activa?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export type EstadoVisibilidadPortafolio = "VISIBLE" | "OCULTO" | "ELIMINADO" | string;

export interface PortafolioCorte {
  idPortafolioCorte: string;
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  destacado?: boolean;
  estadoVisibilidad?: EstadoVisibilidadPortafolio;
  motivoModeracion?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  categoria?: CategoriaCorte | null;
  idCategoriaCorte?: string;
}

export interface Notificacion {
  idNotificacion: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  enlaceAccion?: string | null;
  fechaLectura?: string | null;
  fechaCreacion?: string;
  referenciaId?: string;
  metadata?: Record<string, unknown> | null;
}
