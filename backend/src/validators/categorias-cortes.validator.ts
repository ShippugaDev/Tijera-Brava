import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

export const filtrosCategoriasCortesSchema = z.object(paginacionSchema);

export const crearCategoriaCorteSchema = z.object({
  nombre: textoObligatorio("nombre"),
  descripcion: textoOpcional("descripcion")
});

export const actualizarCategoriaCorteSchema = z
  .object({
    nombre: textoOpcional("nombre"),
    descripcion: textoOpcional("descripcion"),
    activa: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export type FiltrosCategoriasCortesInput = z.infer<typeof filtrosCategoriasCortesSchema>;
export type CrearCategoriaCorteInput = z.infer<typeof crearCategoriaCorteSchema>;
export type ActualizarCategoriaCorteInput = z.infer<typeof actualizarCategoriaCorteSchema>;
