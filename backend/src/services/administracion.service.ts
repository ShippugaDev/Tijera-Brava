import {
  EstadoPago,
  EstadoReserva,
  EstadoSimulacionLookIA
} from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { administracionRepository } from "../repositories/administracion.repository";
import { obtenerZonaHoraria } from "../utils/fechas";
import type {
  FiltrosActividadRecienteAdminInput,
  FiltrosBarberosAdminInput,
  FiltrosLookIAAdminInput,
  FiltrosModeracionAdminInput,
  FiltrosPagosAdminInput,
  FiltrosReservasAdminInput,
  FiltrosServiciosAdminInput
} from "../validators/administracion.validator";

const sumar = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + selector(item), 0);

const fechaAgrupada = (fecha: Date, formato: "dia" | "mes") =>
  formatInTimeZone(
    fecha,
    obtenerZonaHoraria(),
    formato === "dia" ? "yyyy-MM-dd" : "yyyy-MM"
  );

const incrementarGrupo = <T extends Record<string, unknown>>(
  mapa: Map<string, T & { total: number }>,
  clave: string,
  base: T,
  incremento = 1
) => {
  const actual = mapa.get(clave);
  if (actual) {
    actual.total += incremento;
    return;
  }
  mapa.set(clave, { ...base, total: incremento });
};

export const administracionService = {
  async obtenerDashboard() {
    const datos = await administracionRepository.obtenerDashboard();

    return {
      usuarios: {
        totalUsuarios: datos.totalUsuarios,
        totalClientes: datos.totalClientes,
        totalBarberos: datos.totalBarberos,
        totalAdministradores: datos.totalAdministradores,
        usuariosActivos: datos.usuariosActivos,
        usuariosSuspendidos: datos.usuariosSuspendidos
      },
      barberos: {
        aprobados: datos.barberosAprobados,
        pendientes: datos.barberosPendientes,
        rechazados: datos.barberosRechazados
      },
      reservas: {
        totalReservas: datos.totalReservas,
        pendientes: datos.reservasPendientes,
        confirmadas: datos.reservasConfirmadas,
        finalizadas: datos.reservasFinalizadas,
        canceladas: datos.reservasCanceladas,
        rechazadas: datos.reservasRechazadas
      },
      pagos: {
        totalPagos: datos.totalPagos,
        pendientes: datos.pagosPendientes,
        comprobantesSubidos: datos.pagosComprobantesSubidos,
        confirmados: datos.pagosConfirmados,
        cancelados: datos.pagosCancelados,
        reembolsados: datos.pagosReembolsados,
        montoTotalConfirmado: datos.montoTotalConfirmado
      },
      lookia: {
        totalSimulaciones: datos.totalSimulaciones,
        completadas: datos.lookiaCompletadas,
        fallidas: datos.lookiaFallidas,
        eliminadas: datos.lookiaEliminadas
      },
      calificaciones: {
        totalCalificaciones: datos.totalCalificaciones,
        promedioGeneral: datos.promedioGeneral
      },
      portafolio: {
        totalPublicaciones: datos.totalPublicaciones,
        visibles: datos.publicacionesVisibles,
        ocultas: datos.publicacionesOcultas,
        eliminadas: datos.publicacionesEliminadas
      },
      notificaciones: {
        totalNotificaciones: datos.totalNotificaciones,
        noLeidas: datos.notificacionesNoLeidas
      }
    };
  },

  async estadisticasReservas(filtros: FiltrosReservasAdminInput) {
    const reservas = await administracionRepository.listarReservasParaEstadisticas(filtros);
    const mapa = new Map<string, Record<string, unknown> & { total: number }>();

    for (const reserva of reservas) {
      if (filtros.agruparPor === "dia" || filtros.agruparPor === "mes") {
        const clave = fechaAgrupada(reserva.fechaReserva, filtros.agruparPor);
        incrementarGrupo(mapa, clave, { periodo: clave });
      }

      if (filtros.agruparPor === "estado") {
        incrementarGrupo(mapa, reserva.estadoReserva, { estadoReserva: reserva.estadoReserva });
      }

      if (filtros.agruparPor === "barbero") {
        incrementarGrupo(mapa, reserva.barbero.idBarbero, {
          estado: reserva.estadoReserva,
          barbero: reserva.barbero
        });
      }

      if (filtros.agruparPor === "servicio") {
        incrementarGrupo(mapa, reserva.servicio.idServicio, {
          estado: reserva.estadoReserva,
          servicio: reserva.servicio
        });
      }
    }

    return {
      agrupadoPor: filtros.agruparPor,
      resultados: Array.from(mapa.values()).sort((a, b) => b.total - a.total)
    };
  },

  async estadisticasPagos(filtros: FiltrosPagosAdminInput) {
    const pagos = await administracionRepository.listarPagosParaEstadisticas(filtros);
    const mapa = new Map<string, Record<string, unknown> & { total: number; montoTotal: number }>();

    for (const pago of pagos) {
      const monto = Number(pago.montoTotal);
      const clave =
        filtros.agruparPor === "mes"
          ? fechaAgrupada(pago.fechaCreacion, "mes")
          : filtros.agruparPor === "metodo"
            ? pago.metodoPago
            : pago.estadoPago;
      const base =
        filtros.agruparPor === "mes"
          ? { periodo: clave }
          : filtros.agruparPor === "metodo"
            ? { metodoPago: clave }
            : { estadoPago: clave };
      const actual = mapa.get(clave);

      if (actual) {
        actual.total += 1;
        actual.montoTotal += monto;
      } else {
        mapa.set(clave, { ...base, total: 1, montoTotal: monto });
      }
    }

    return {
      resumen: {
        totalPagos: pagos.length,
        montoTotal: sumar(pagos, (pago) => Number(pago.montoTotal)),
        montoConfirmado: sumar(pagos, (pago) =>
          pago.estadoPago === EstadoPago.CONFIRMADO ? Number(pago.montoTotal) : 0
        ),
        montoReembolsado: sumar(pagos, (pago) =>
          pago.estadoPago === EstadoPago.REEMBOLSADO ? Number(pago.montoTotal) : 0
        )
      },
      resultados: Array.from(mapa.values()).sort((a, b) => b.total - a.total)
    };
  },

  async estadisticasServicios(filtros: FiltrosServiciosAdminInput) {
    const reservas = await administracionRepository.listarServiciosParaEstadisticas(filtros);
    const mapa = new Map<
      string,
      {
        idServicio: string;
        nombre: string;
        totalReservas: number;
        totalFinalizadas: number;
        montoGenerado: number;
      }
    >();

    for (const reserva of reservas) {
      const servicio = reserva.servicio;
      const actual =
        mapa.get(servicio.idServicio) ??
        {
          idServicio: servicio.idServicio,
          nombre: servicio.nombre,
          totalReservas: 0,
          totalFinalizadas: 0,
          montoGenerado: 0
        };

      actual.totalReservas += 1;
      if (reserva.estadoReserva === EstadoReserva.FINALIZADA) {
        actual.totalFinalizadas += 1;
        actual.montoGenerado += Number(reserva.total);
      }
      mapa.set(servicio.idServicio, actual);
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.totalReservas - a.totalReservas)
      .slice(0, filtros.limite);
  },

  async estadisticasBarberos(filtros: FiltrosBarberosAdminInput) {
    const barberos = await administracionRepository.listarBarberosParaEstadisticas(filtros);
    const ranking = barberos.map((barbero) => {
      const totalCalificaciones = barbero.calificaciones.length;
      const promedioCalificacion =
        totalCalificaciones > 0
          ? Number(
              (
                sumar(barbero.calificaciones, (calificacion) => calificacion.puntuacion) /
                totalCalificaciones
              ).toFixed(2)
            )
          : Number(barbero.calificacionPromedio);

      return {
        idBarbero: barbero.idBarbero,
        nombreProfesional: barbero.nombreProfesional,
        estadoAprobacion: barbero.estadoAprobacion,
        totalReservas: barbero.reservas.length,
        reservasFinalizadas: barbero.reservas.filter(
          (reserva) => reserva.estadoReserva === EstadoReserva.FINALIZADA
        ).length,
        promedioCalificacion,
        totalCalificaciones,
        montoGenerado: sumar(barbero.reservas, (reserva) =>
          reserva.estadoReserva === EstadoReserva.FINALIZADA ? Number(reserva.total) : 0
        ),
        totalPortafolios: barbero.portafoliosCortes.length
      };
    });

    const comparadores = {
      reservas: (a: (typeof ranking)[number], b: (typeof ranking)[number]) =>
        b.totalReservas - a.totalReservas,
      calificacion: (a: (typeof ranking)[number], b: (typeof ranking)[number]) =>
        b.promedioCalificacion - a.promedioCalificacion,
      ingresos: (a: (typeof ranking)[number], b: (typeof ranking)[number]) =>
        b.montoGenerado - a.montoGenerado,
      portafolio: (a: (typeof ranking)[number], b: (typeof ranking)[number]) =>
        b.totalPortafolios - a.totalPortafolios
    };

    return ranking.sort(comparadores[filtros.ordenarPor]).slice(0, filtros.limite);
  },

  async estadisticasLookIA(filtros: FiltrosLookIAAdminInput) {
    const simulaciones = await administracionRepository.listarLookIAParaEstadisticas(filtros);
    const mapa = new Map<string, Record<string, unknown> & { total: number }>();

    for (const simulacion of simulaciones) {
      if (filtros.agruparPor === "estado") {
        incrementarGrupo(mapa, simulacion.estadoSimulacion, {
          estadoSimulacion: simulacion.estadoSimulacion
        });
      }

      if (filtros.agruparPor === "estilo") {
        incrementarGrupo(mapa, simulacion.estiloLookIA.idEstiloLookIA, {
          estilo: {
            idEstiloLookIA: simulacion.estiloLookIA.idEstiloLookIA,
            nombre: simulacion.estiloLookIA.nombre
          }
        });
      }

      if (filtros.agruparPor === "categoria") {
        const categoria = simulacion.estiloLookIA.categoriaCorte;
        const clave = categoria?.idCategoriaCorte ?? "sin-categoria";
        incrementarGrupo(mapa, clave, {
          categoria: categoria
            ? {
                idCategoriaCorte: categoria.idCategoriaCorte,
                nombre: categoria.nombre
              }
            : null
        });
      }

      if (filtros.agruparPor === "mes") {
        const periodo = fechaAgrupada(simulacion.fechaCreacion, "mes");
        incrementarGrupo(mapa, periodo, { periodo });
      }
    }

    return {
      resumen: {
        totalSimulaciones: simulaciones.length,
        completadas: simulaciones.filter(
          (simulacion) => simulacion.estadoSimulacion === EstadoSimulacionLookIA.COMPLETADA
        ).length,
        fallidas: simulaciones.filter(
          (simulacion) => simulacion.estadoSimulacion === EstadoSimulacionLookIA.FALLIDA
        ).length,
        eliminadas: simulaciones.filter(
          (simulacion) => simulacion.estadoSimulacion === EstadoSimulacionLookIA.ELIMINADA
        ).length
      },
      resultados: Array.from(mapa.values()).sort((a, b) => b.total - a.total)
    };
  },

  async actividadReciente(filtros: FiltrosActividadRecienteAdminInput) {
    const actividad = await administracionRepository.obtenerActividadReciente(filtros.limite);
    const items = [
      ...actividad.reservas.map((reserva) => ({
        tipo: "RESERVA",
        titulo: "Nueva reserva creada",
        descripcion: `${reserva.cliente.usuario.nombres} ${reserva.cliente.usuario.apellidos} reservó con ${reserva.barbero.nombreProfesional}`,
        fecha: reserva.fechaCreacion,
        referencia: { id: reserva.idReserva, modulo: "reservas" }
      })),
      ...actividad.pagos.map((pago) => ({
        tipo: "PAGO",
        titulo: `Pago ${pago.estadoPago.toLowerCase().replace(/_/g, " ")}`,
        descripcion: `Se registró un pago por S/ ${Number(pago.montoTotal).toFixed(2)}`,
        fecha: pago.fechaActualizacion,
        referencia: { id: pago.idPago, modulo: "pagos" }
      })),
      ...actividad.calificaciones.map((calificacion) => ({
        tipo: "CALIFICACION",
        titulo: "Nueva calificación registrada",
        descripcion: `${calificacion.barbero.nombreProfesional} recibió ${calificacion.puntuacion} estrellas`,
        fecha: calificacion.fechaCreacion,
        referencia: { id: calificacion.idCalificacion, modulo: "calificaciones" }
      })),
      ...actividad.simulaciones.map((simulacion) => ({
        tipo: "LOOKIA",
        titulo: "Simulación LookIA creada",
        descripcion: `Simulación ${simulacion.estadoSimulacion.toLowerCase()} para ${simulacion.estiloLookIA.nombre}`,
        fecha: simulacion.fechaCreacion,
        referencia: { id: simulacion.idSimulacionLookIA, modulo: "lookia" }
      })),
      ...actividad.barberosPendientes.map((barbero) => ({
        tipo: "BARBERO",
        titulo: "Barbero pendiente de revisión",
        descripcion: `${barbero.nombreProfesional} está pendiente de aprobación`,
        fecha: barbero.fechaCreacion,
        referencia: { id: barbero.idBarbero, modulo: "barberos" }
      }))
    ];

    return items
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, filtros.limite);
  },

  listarPortafoliosModeracion(filtros: FiltrosModeracionAdminInput) {
    return administracionRepository.listarPortafoliosModeracion(filtros.limite);
  },

  listarCalificacionesModeracion(filtros: FiltrosModeracionAdminInput) {
    return administracionRepository.listarCalificacionesModeracion(filtros.limite);
  }
};
