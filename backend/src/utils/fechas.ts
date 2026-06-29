import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { DiaSemana } from "@prisma/client";

export const obtenerZonaHoraria = () =>
  process.env.APP_TIMEZONE ?? "America/Lima";

export const obtenerFechaActualEnZona = () =>
  formatInTimeZone(new Date(), obtenerZonaHoraria(), "yyyy-MM-dd");

export const esFechaPasadaEnZona = (fecha: string) =>
  fecha < obtenerFechaActualEnZona();

export const crearFechaHoraEnZona = (fecha: string, hora: string) =>
  fromZonedTime(`${fecha}T${hora}:00`, obtenerZonaHoraria());

export const inicioDelDiaEnZona = (fecha: string) =>
  crearFechaHoraEnZona(fecha, "00:00");

export const finDelDiaEnZona = (fecha: string) =>
  addDays(inicioDelDiaEnZona(fecha), 1);

export const fechaConsultaADiaSemana = (fecha: string) => {
  const nombreDia = formatInTimeZone(
    crearFechaHoraEnZona(fecha, "12:00"),
    obtenerZonaHoraria(),
    "EEEE"
  ).toLowerCase();

  const mapa: Record<string, DiaSemana> = {
    monday: DiaSemana.LUNES,
    tuesday: DiaSemana.MARTES,
    wednesday: DiaSemana.MIERCOLES,
    thursday: DiaSemana.JUEVES,
    friday: DiaSemana.VIERNES,
    saturday: DiaSemana.SABADO,
    sunday: DiaSemana.DOMINGO
  };

  return mapa[nombreDia];
};
