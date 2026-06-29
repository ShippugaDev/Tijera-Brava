import { DiaSemana } from "@prisma/client";
import { z } from "zod";
import { paginacionSchema, textoOpcional } from "./comun.validator";
import { esRangoHorarioValido } from "../utils/horarios";

const horaSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato HH:mm");

const fechaSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

const fechaIsoSchema = z
  .string()
  .trim()
  .datetime({ offset: true, message: "La fecha debe ser ISO 8601 con zona horaria" });

export const crearHorarioSchema = z
  .object({
    diaSemana: z.nativeEnum(DiaSemana),
    horaInicio: horaSchema,
    horaFin: horaSchema
  })
  .refine((data) => esRangoHorarioValido(data.horaInicio, data.horaFin), {
    message: "horaInicio debe ser menor que horaFin"
  });

export const actualizarHorarioSchema = z
  .object({
    diaSemana: z.nativeEnum(DiaSemana).optional(),
    horaInicio: horaSchema.optional(),
    horaFin: horaSchema.optional(),
    activo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const filtrosBloqueosSchema = z.object({
  ...paginacionSchema,
  desde: fechaSchema.optional(),
  hasta: fechaSchema.optional(),
  activo: z
    .preprocess((valor) => {
      if (valor === undefined) return undefined;
      if (valor === "true") return true;
      if (valor === "false") return false;
      return valor;
    }, z.boolean().optional())
});

export const crearBloqueoSchema = z
  .object({
    fechaInicio: fechaIsoSchema,
    fechaFin: fechaIsoSchema,
    motivo: textoOpcional("motivo")
  })
  .refine((data) => new Date(data.fechaInicio) < new Date(data.fechaFin), {
    message: "fechaInicio debe ser anterior a fechaFin"
  });

export const actualizarBloqueoSchema = z
  .object({
    fechaInicio: fechaIsoSchema.optional(),
    fechaFin: fechaIsoSchema.optional(),
    motivo: textoOpcional("motivo"),
    activo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const consultaDisponibilidadSchema = z.object({
  fecha: fechaSchema,
  idServicio: z.string().uuid("idServicio debe ser un UUID válido"),
  idZonaCobertura: z.string().uuid("idZonaCobertura debe ser un UUID válido")
});

export type CrearHorarioInput = z.infer<typeof crearHorarioSchema>;
export type ActualizarHorarioInput = z.infer<typeof actualizarHorarioSchema>;
export type FiltrosBloqueosInput = z.infer<typeof filtrosBloqueosSchema>;
export type CrearBloqueoInput = z.infer<typeof crearBloqueoSchema>;
export type ActualizarBloqueoInput = z.infer<typeof actualizarBloqueoSchema>;
export type ConsultaDisponibilidadInput = z.infer<
  typeof consultaDisponibilidadSchema
>;
