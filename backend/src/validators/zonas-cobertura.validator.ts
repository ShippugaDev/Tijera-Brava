import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

const costoTraslado = z
  .number({ message: "costoTraslado debe ser un número" })
  .min(0, "costoTraslado debe ser mayor o igual que cero");

const tiempoTraslado = z
  .number({ message: "tiempoTrasladoMinutos debe ser un número" })
  .int("tiempoTrasladoMinutos debe ser un entero")
  .positive("tiempoTrasladoMinutos debe ser mayor que cero");

export const filtrosZonasCoberturaSchema = z.object({
  ...paginacionSchema,
  distrito: textoOpcional("distrito")
});

export const crearZonaCoberturaSchema = z.object({
  nombre: textoObligatorio("nombre"),
  distrito: textoObligatorio("distrito"),
  provincia: textoOpcional("provincia"),
  departamento: textoOpcional("departamento")
});

export const actualizarZonaCoberturaSchema = z
  .object({
    nombre: textoOpcional("nombre"),
    distrito: textoOpcional("distrito"),
    provincia: textoOpcional("provincia"),
    departamento: textoOpcional("departamento"),
    activa: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const asignarZonaBarberoSchema = z.object({
  idZonaCobertura: z.string().uuid("idZonaCobertura debe ser un UUID válido"),
  costoTraslado: costoTraslado.optional(),
  tiempoTrasladoMinutos: tiempoTraslado.optional()
});

export const actualizarZonaBarberoSchema = z
  .object({
    costoTraslado: costoTraslado.optional(),
    tiempoTrasladoMinutos: tiempoTraslado.optional(),
    activa: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export type FiltrosZonasCoberturaInput = z.infer<
  typeof filtrosZonasCoberturaSchema
>;
export type CrearZonaCoberturaInput = z.infer<typeof crearZonaCoberturaSchema>;
export type ActualizarZonaCoberturaInput = z.infer<
  typeof actualizarZonaCoberturaSchema
>;
export type AsignarZonaBarberoInput = z.infer<typeof asignarZonaBarberoSchema>;
export type ActualizarZonaBarberoInput = z.infer<
  typeof actualizarZonaBarberoSchema
>;
