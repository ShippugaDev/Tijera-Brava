import { EstadoReserva, MetodoPago } from "@prisma/client";
import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

const fechaSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

const horaSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato HH:mm");

export const crearReservaSchema = z.object({
  idBarbero: z.string().uuid("idBarbero debe ser un UUID válido"),
  idServicio: z.string().uuid("idServicio debe ser un UUID válido"),
  idZonaCobertura: z.string().uuid("idZonaCobertura debe ser un UUID válido"),
  fechaReserva: fechaSchema,
  horaInicio: horaSchema,
  metodoPago: z.nativeEnum(MetodoPago),
  indicacionesCliente: textoOpcional("indicacionesCliente")
});

export const filtrosReservasSchema = z.object({
  ...paginacionSchema,
  estado: z.nativeEnum(EstadoReserva).optional(),
  idBarbero: z.string().uuid("idBarbero debe ser un UUID válido").optional(),
  idCliente: z.string().uuid("idCliente debe ser un UUID válido").optional(),
  desde: fechaSchema.optional(),
  hasta: fechaSchema.optional()
});

export const motivoObligatorioSchema = z.object({
  motivo: textoObligatorio("motivo")
});

export const motivoOpcionalSchema = z.object({
  motivo: textoOpcional("motivo")
});

export type CrearReservaInput = z.infer<typeof crearReservaSchema>;
export type FiltrosReservasInput = z.infer<typeof filtrosReservasSchema>;
export type MotivoObligatorioInput = z.infer<typeof motivoObligatorioSchema>;
export type MotivoOpcionalInput = z.infer<typeof motivoOpcionalSchema>;
