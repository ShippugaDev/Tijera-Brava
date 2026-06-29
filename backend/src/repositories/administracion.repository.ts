import {
  EstadoAprobacion,
  EstadoCuenta,
  EstadoPago,
  EstadoReserva,
  EstadoSimulacionLookIA,
  EstadoVisibilidadCalificacion,
  EstadoVisibilidadPortafolio,
  type Prisma
} from "@prisma/client";
import { prisma } from "../config/prisma";
import { finDelDiaEnZona, inicioDelDiaEnZona } from "../utils/fechas";
import type {
  FiltrosBarberosAdminInput,
  FiltrosLookIAAdminInput,
  FiltrosPagosAdminInput,
  FiltrosReservasAdminInput,
  FiltrosServiciosAdminInput
} from "../validators/administracion.validator";

type FiltroFecha = {
  desde?: string;
  hasta?: string;
};

const rangoFechas = (filtros: FiltroFecha) => {
  if (!filtros.desde && !filtros.hasta) return undefined;
  return {
    gte: filtros.desde ? inicioDelDiaEnZona(filtros.desde) : undefined,
    lt: filtros.hasta ? finDelDiaEnZona(filtros.hasta) : undefined
  };
};

const whereReservas = (filtros: FiltroFecha): Prisma.ReservaWhereInput => ({
  fechaReserva: rangoFechas(filtros)
});

const whereFechaCreacionPago = (filtros: FiltroFecha): Prisma.PagoWhereInput => ({
  fechaCreacion: rangoFechas(filtros)
});

const whereFechaCreacionSimulacion = (
  filtros: FiltroFecha
): Prisma.SimulacionLookIAWhereInput => ({
  fechaCreacion: rangoFechas(filtros)
});

export const administracionRepository = {
  async obtenerDashboard() {
    const canceladas = [
      EstadoReserva.CANCELADA_CLIENTE,
      EstadoReserva.CANCELADA_BARBERO,
      EstadoReserva.CANCELADA_ADMINISTRACION
    ];

    const [
      totalUsuarios,
      totalClientes,
      totalBarberos,
      totalAdministradores,
      usuariosActivos,
      usuariosSuspendidos,
      barberosAprobados,
      barberosPendientes,
      barberosRechazados,
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasFinalizadas,
      reservasCanceladas,
      reservasRechazadas,
      totalPagos,
      pagosPendientes,
      pagosComprobantesSubidos,
      pagosConfirmados,
      pagosCancelados,
      pagosReembolsados,
      montoConfirmado,
      totalSimulaciones,
      lookiaCompletadas,
      lookiaFallidas,
      lookiaEliminadas,
      resumenCalificaciones,
      totalPublicaciones,
      publicacionesVisibles,
      publicacionesOcultas,
      publicacionesEliminadas,
      totalNotificaciones,
      notificacionesNoLeidas
    ] = await prisma.$transaction([
      prisma.usuario.count(),
      prisma.cliente.count(),
      prisma.barbero.count(),
      prisma.usuario.count({ where: { rol: { nombre: "ADMINISTRADOR" } } }),
      prisma.usuario.count({ where: { estadoCuenta: EstadoCuenta.ACTIVO } }),
      prisma.usuario.count({ where: { estadoCuenta: EstadoCuenta.SUSPENDIDO } }),
      prisma.barbero.count({ where: { estadoAprobacion: EstadoAprobacion.APROBADO } }),
      prisma.barbero.count({ where: { estadoAprobacion: EstadoAprobacion.PENDIENTE } }),
      prisma.barbero.count({ where: { estadoAprobacion: EstadoAprobacion.RECHAZADO } }),
      prisma.reserva.count(),
      prisma.reserva.count({ where: { estadoReserva: EstadoReserva.PENDIENTE } }),
      prisma.reserva.count({ where: { estadoReserva: EstadoReserva.CONFIRMADA } }),
      prisma.reserva.count({ where: { estadoReserva: EstadoReserva.FINALIZADA } }),
      prisma.reserva.count({ where: { estadoReserva: { in: canceladas } } }),
      prisma.reserva.count({ where: { estadoReserva: EstadoReserva.RECHAZADA } }),
      prisma.pago.count(),
      prisma.pago.count({ where: { estadoPago: EstadoPago.PENDIENTE } }),
      prisma.pago.count({ where: { estadoPago: EstadoPago.COMPROBANTE_SUBIDO } }),
      prisma.pago.count({ where: { estadoPago: EstadoPago.CONFIRMADO } }),
      prisma.pago.count({ where: { estadoPago: EstadoPago.CANCELADO } }),
      prisma.pago.count({ where: { estadoPago: EstadoPago.REEMBOLSADO } }),
      prisma.pago.aggregate({
        where: { estadoPago: EstadoPago.CONFIRMADO },
        _sum: { montoTotal: true }
      }),
      prisma.simulacionLookIA.count(),
      prisma.simulacionLookIA.count({
        where: { estadoSimulacion: EstadoSimulacionLookIA.COMPLETADA }
      }),
      prisma.simulacionLookIA.count({
        where: { estadoSimulacion: EstadoSimulacionLookIA.FALLIDA }
      }),
      prisma.simulacionLookIA.count({
        where: { estadoSimulacion: EstadoSimulacionLookIA.ELIMINADA }
      }),
      prisma.calificacion.aggregate({
        _count: true,
        _avg: { puntuacion: true }
      }),
      prisma.portafolioCorte.count(),
      prisma.portafolioCorte.count({
        where: { estadoVisibilidad: EstadoVisibilidadPortafolio.VISIBLE }
      }),
      prisma.portafolioCorte.count({
        where: { estadoVisibilidad: EstadoVisibilidadPortafolio.OCULTO }
      }),
      prisma.portafolioCorte.count({
        where: { estadoVisibilidad: EstadoVisibilidadPortafolio.ELIMINADO }
      }),
      prisma.notificacion.count(),
      prisma.notificacion.count({ where: { leida: false } })
    ]);

    return {
      totalUsuarios,
      totalClientes,
      totalBarberos,
      totalAdministradores,
      usuariosActivos,
      usuariosSuspendidos,
      barberosAprobados,
      barberosPendientes,
      barberosRechazados,
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasFinalizadas,
      reservasCanceladas,
      reservasRechazadas,
      totalPagos,
      pagosPendientes,
      pagosComprobantesSubidos,
      pagosConfirmados,
      pagosCancelados,
      pagosReembolsados,
      montoTotalConfirmado: Number(montoConfirmado._sum.montoTotal ?? 0),
      totalSimulaciones,
      lookiaCompletadas,
      lookiaFallidas,
      lookiaEliminadas,
      totalCalificaciones: resumenCalificaciones._count,
      promedioGeneral: Number((resumenCalificaciones._avg.puntuacion ?? 0).toFixed(2)),
      totalPublicaciones,
      publicacionesVisibles,
      publicacionesOcultas,
      publicacionesEliminadas,
      totalNotificaciones,
      notificacionesNoLeidas
    };
  },

  listarReservasParaEstadisticas(filtros: FiltrosReservasAdminInput) {
    return prisma.reserva.findMany({
      where: whereReservas(filtros),
      select: {
        idReserva: true,
        fechaReserva: true,
        estadoReserva: true,
        total: true,
        barbero: {
          select: {
            idBarbero: true,
            nombreProfesional: true
          }
        },
        servicio: {
          select: {
            idServicio: true,
            nombre: true
          }
        }
      }
    });
  },

  listarPagosParaEstadisticas(filtros: FiltrosPagosAdminInput) {
    return prisma.pago.findMany({
      where: whereFechaCreacionPago(filtros),
      select: {
        idPago: true,
        fechaCreacion: true,
        estadoPago: true,
        metodoPago: true,
        montoTotal: true
      }
    });
  },

  listarServiciosParaEstadisticas(filtros: FiltrosServiciosAdminInput) {
    return prisma.reserva.findMany({
      where: whereReservas(filtros),
      select: {
        estadoReserva: true,
        total: true,
        servicio: {
          select: {
            idServicio: true,
            nombre: true
          }
        }
      }
    });
  },

  listarBarberosParaEstadisticas(filtros: FiltrosBarberosAdminInput) {
    return prisma.barbero.findMany({
      select: {
        idBarbero: true,
        nombreProfesional: true,
        estadoAprobacion: true,
        calificacionPromedio: true,
        reservas: {
          where: whereReservas(filtros),
          select: {
            estadoReserva: true,
            total: true
          }
        },
        calificaciones: {
          where: { estadoVisibilidad: EstadoVisibilidadCalificacion.VISIBLE },
          select: { puntuacion: true }
        },
        portafoliosCortes: {
          select: { idPortafolioCorte: true }
        }
      }
    });
  },

  listarLookIAParaEstadisticas(filtros: FiltrosLookIAAdminInput) {
    return prisma.simulacionLookIA.findMany({
      where: whereFechaCreacionSimulacion(filtros),
      select: {
        idSimulacionLookIA: true,
        fechaCreacion: true,
        estadoSimulacion: true,
        estiloLookIA: {
          select: {
            idEstiloLookIA: true,
            nombre: true,
            categoriaCorte: {
              select: {
                idCategoriaCorte: true,
                nombre: true
              }
            }
          }
        }
      }
    });
  },

  async obtenerActividadReciente(limite: number) {
    const [reservas, pagos, calificaciones, simulaciones, barberosPendientes] =
      await prisma.$transaction([
        prisma.reserva.findMany({
          take: limite,
          orderBy: { fechaCreacion: "desc" },
          select: {
            idReserva: true,
            fechaCreacion: true,
            cliente: {
              select: {
                usuario: {
                  select: { nombres: true, apellidos: true }
                }
              }
            },
            barbero: {
              select: { nombreProfesional: true }
            }
          }
        }),
        prisma.pago.findMany({
          take: limite,
          orderBy: { fechaActualizacion: "desc" },
          select: {
            idPago: true,
            estadoPago: true,
            montoTotal: true,
            fechaActualizacion: true
          }
        }),
        prisma.calificacion.findMany({
          take: limite,
          orderBy: { fechaCreacion: "desc" },
          select: {
            idCalificacion: true,
            puntuacion: true,
            fechaCreacion: true,
            barbero: {
              select: { nombreProfesional: true }
            }
          }
        }),
        prisma.simulacionLookIA.findMany({
          take: limite,
          orderBy: { fechaCreacion: "desc" },
          select: {
            idSimulacionLookIA: true,
            estadoSimulacion: true,
            fechaCreacion: true,
            estiloLookIA: {
              select: { nombre: true }
            }
          }
        }),
        prisma.barbero.findMany({
          take: limite,
          where: { estadoAprobacion: EstadoAprobacion.PENDIENTE },
          orderBy: { fechaCreacion: "desc" },
          select: {
            idBarbero: true,
            nombreProfesional: true,
            fechaCreacion: true
          }
        })
      ]);

    return {
      reservas,
      pagos,
      calificaciones,
      simulaciones,
      barberosPendientes
    };
  },

  listarPortafoliosModeracion(limite: number) {
    return prisma.portafolioCorte.findMany({
      take: limite,
      orderBy: { fechaCreacion: "desc" },
      select: {
        idPortafolioCorte: true,
        titulo: true,
        descripcion: true,
        imagenUrl: true,
        destacado: true,
        estadoVisibilidad: true,
        motivoModeracion: true,
        fechaCreacion: true,
        categoriaCorte: {
          select: {
            idCategoriaCorte: true,
            nombre: true
          }
        },
        barbero: {
          select: {
            idBarbero: true,
            nombreProfesional: true,
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                correo: true
              }
            }
          }
        }
      }
    });
  },

  listarCalificacionesModeracion(limite: number) {
    return prisma.calificacion.findMany({
      take: limite,
      orderBy: { fechaCreacion: "desc" },
      select: {
        idCalificacion: true,
        puntuacion: true,
        comentario: true,
        estadoVisibilidad: true,
        motivoModeracion: true,
        fechaCreacion: true,
        cliente: {
          select: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                correo: true
              }
            }
          }
        },
        barbero: {
          select: {
            idBarbero: true,
            nombreProfesional: true,
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                correo: true
              }
            }
          }
        },
        reserva: {
          select: {
            idReserva: true,
            fechaReserva: true,
            servicio: {
              select: {
                idServicio: true,
                nombre: true
              }
            }
          }
        }
      }
    });
  }
};
