import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

const precioPositivo = z
  .number({ message: "El precio debe ser un número" })
  .positive("El precio debe ser mayor que cero");

const duracionPositiva = z
  .number({ message: "La duración debe ser un número" })
  .int("La duración debe ser un entero")
  .positive("La duración debe ser mayor que cero");

export const filtrosServiciosSchema = z.object(paginacionSchema);

export const crearServicioSchema = z.object({
  nombre: textoObligatorio("nombre"),
  descripcion: textoOpcional("descripcion"),
  precioBase: precioPositivo,
  duracionMinutos: duracionPositiva
});

export const actualizarServicioSchema = z
  .object({
    nombre: textoOpcional("nombre"),
    descripcion: textoOpcional("descripcion"),
    precioBase: precioPositivo.optional(),
    duracionMinutos: duracionPositiva.optional(),
    activo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const asignarServicioBarberoSchema = z.object({
  idServicio: z.string().uuid("idServicio debe ser un UUID válido"),
  precioPersonalizado: precioPositivo.optional(),
  duracionPersonalizada: duracionPositiva.optional()
});

export const actualizarServicioBarberoSchema = z
  .object({
    precioPersonalizado: precioPositivo.optional(),
    duracionPersonalizada: duracionPositiva.optional(),
    activo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export type FiltrosServiciosInput = z.infer<typeof filtrosServiciosSchema>;
export type CrearServicioInput = z.infer<typeof crearServicioSchema>;
export type ActualizarServicioInput = z.infer<typeof actualizarServicioSchema>;
export type AsignarServicioBarberoInput = z.infer<
  typeof asignarServicioBarberoSchema
>;
export type ActualizarServicioBarberoInput = z.infer<
  typeof actualizarServicioBarberoSchema
>;
