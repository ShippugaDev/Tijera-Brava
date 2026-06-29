import { EstadoReserva } from "@prisma/client";
import { horaDesdeMinutos, minutosDesdeHora } from "./horarios";

export const estadosQueOcupanAgenda: EstadoReserva[] = [
  EstadoReserva.PENDIENTE,
  EstadoReserva.CONFIRMADA,
  EstadoReserva.EN_CAMINO,
  EstadoReserva.EN_SERVICIO
];

export const calcularHoraFinReserva = (
  horaInicio: string,
  duracionMinutos: number
) => horaDesdeMinutos(minutosDesdeHora(horaInicio) + duracionMinutos);

export const reservaOcupaAgenda = (estado: EstadoReserva) =>
  estadosQueOcupanAgenda.includes(estado);
