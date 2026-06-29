import type { DiaSemana, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarBloqueoInput,
  ActualizarHorarioInput,
  CrearBloqueoInput,
  CrearHorarioInput,
  FiltrosBloqueosInput
} from "../validators/disponibilidad.validator";
import { finDelDiaEnZona, inicioDelDiaEnZona } from "../utils/fechas";

const horarioSelect = {
  idHorarioDisponibilidad: true,
  idBarbero: true,
  diaSemana: true,
  horaInicio: true,
  horaFin: true,
  activo: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.HorarioDisponibilidadSelect;

const bloqueoSelect = {
  idBloqueoHorario: true,
  idBarbero: true,
  fechaInicio: true,
  fechaFin: true,
  motivo: true,
  activo: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.BloqueoHorarioSelect;

export type HorarioDisponibilidadDetalle =
  Prisma.HorarioDisponibilidadGetPayload<{
    select: typeof horarioSelect;
  }>;
export type BloqueoHorarioDetalle = Prisma.BloqueoHorarioGetPayload<{
  select: typeof bloqueoSelect;
}>;

export const disponibilidadRepository = {
  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  buscarBarberoPublico(idBarbero: string) {
    return prisma.barbero.findUnique({
      where: { idBarbero },
      include: { usuario: true }
    });
  },

  listarHorarios(idBarbero: string) {
    return prisma.horarioDisponibilidad.findMany({
      where: { idBarbero },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
      select: horarioSelect
    });
  },

  listarHorariosActivosPorDia(idBarbero: string, diaSemana: DiaSemana) {
    return prisma.horarioDisponibilidad.findMany({
      where: { idBarbero, diaSemana, activo: true },
      orderBy: { horaInicio: "asc" },
      select: horarioSelect
    });
  },

  buscarHorario(idHorarioDisponibilidad: string) {
    return prisma.horarioDisponibilidad.findUnique({
      where: { idHorarioDisponibilidad },
      select: horarioSelect
    });
  },

  listarHorariosActivosDelDiaExcluyendo(
    idBarbero: string,
    diaSemana: DiaSemana,
    idHorarioDisponibilidad?: string
  ) {
    return prisma.horarioDisponibilidad.findMany({
      where: {
        idBarbero,
        diaSemana,
        activo: true,
        idHorarioDisponibilidad: idHorarioDisponibilidad
          ? { not: idHorarioDisponibilidad }
          : undefined
      },
      select: horarioSelect
    });
  },

  crearHorario(idBarbero: string, data: CrearHorarioInput) {
    return prisma.horarioDisponibilidad.create({
      data: { idBarbero, ...data },
      select: horarioSelect
    });
  },

  actualizarHorario(
    idHorarioDisponibilidad: string,
    data: ActualizarHorarioInput
  ) {
    return prisma.horarioDisponibilidad.update({
      where: { idHorarioDisponibilidad },
      data,
      select: horarioSelect
    });
  },

  desactivarHorario(idHorarioDisponibilidad: string) {
    return prisma.horarioDisponibilidad.update({
      where: { idHorarioDisponibilidad },
      data: { activo: false },
      select: horarioSelect
    });
  },

  reactivarHorario(idHorarioDisponibilidad: string) {
    return prisma.horarioDisponibilidad.update({
      where: { idHorarioDisponibilidad },
      data: { activo: true },
      select: horarioSelect
    });
  },

  async listarBloqueos(idBarbero: string, filtros: FiltrosBloqueosInput) {
    const where: Prisma.BloqueoHorarioWhereInput = { idBarbero };

    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros.desde || filtros.hasta) {
      where.fechaInicio = filtros.hasta
        ? { lt: finDelDiaEnZona(filtros.hasta) }
        : undefined;
      where.fechaFin = filtros.desde
        ? { gt: inicioDelDiaEnZona(filtros.desde) }
        : undefined;
    }

    const skip = (filtros.pagina - 1) * filtros.limite;
    const [bloqueos, totalRegistros] = await prisma.$transaction([
      prisma.bloqueoHorario.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaInicio: "asc" },
        select: bloqueoSelect
      }),
      prisma.bloqueoHorario.count({ where })
    ]);

    return { bloqueos, totalRegistros };
  },

  listarBloqueosActivosEnRango(
    idBarbero: string,
    fechaInicio: Date,
    fechaFin: Date,
    idBloqueoHorario?: string
  ) {
    return prisma.bloqueoHorario.findMany({
      where: {
        idBarbero,
        activo: true,
        idBloqueoHorario: idBloqueoHorario
          ? { not: idBloqueoHorario }
          : undefined,
        fechaInicio: { lt: fechaFin },
        fechaFin: { gt: fechaInicio }
      },
      select: bloqueoSelect
    });
  },

  buscarBloqueo(idBloqueoHorario: string) {
    return prisma.bloqueoHorario.findUnique({
      where: { idBloqueoHorario },
      select: bloqueoSelect
    });
  },

  crearBloqueo(idBarbero: string, data: CrearBloqueoInput) {
    return prisma.bloqueoHorario.create({
      data: {
        idBarbero,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        motivo: data.motivo
      },
      select: bloqueoSelect
    });
  },

  actualizarBloqueo(idBloqueoHorario: string, data: ActualizarBloqueoInput) {
    return prisma.bloqueoHorario.update({
      where: { idBloqueoHorario },
      data: {
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
        motivo: data.motivo,
        activo: data.activo
      },
      select: bloqueoSelect
    });
  },

  desactivarBloqueo(idBloqueoHorario: string) {
    return prisma.bloqueoHorario.update({
      where: { idBloqueoHorario },
      data: { activo: false },
      select: bloqueoSelect
    });
  },

  buscarServicioActivoBarbero(idBarbero: string, idServicio: string) {
    return prisma.servicioBarbero.findFirst({
      where: {
        idBarbero,
        idServicio,
        activo: true,
        servicio: { activo: true }
      },
      include: { servicio: true }
    });
  },

  buscarZonaActivaBarbero(idBarbero: string, idZonaCobertura: string) {
    return prisma.zonaBarbero.findFirst({
      where: {
        idBarbero,
        idZonaCobertura,
        activa: true,
        zonaCobertura: { activa: true }
      },
      include: { zonaCobertura: true }
    });
  }
};
