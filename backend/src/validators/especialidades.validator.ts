import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

export const filtrosEspecialidadesSchema = z.object(paginacionSchema);

export const crearEspecialidadSchema = z.object({
  nombre: textoObligatorio("nombre"),
  descripcion: textoOpcional("descripcion")
});

export const actualizarEspecialidadSchema = z
  .object({
    nombre: textoOpcional("nombre"),
    descripcion: textoOpcional("descripcion"),
    activa: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const asignarEspecialidadSchema = z.object({
  idEspecialidad: z.string().uuid("idEspecialidad debe ser un UUID válido")
});

export type FiltrosEspecialidadesInput = z.infer<
  typeof filtrosEspecialidadesSchema
>;
export type CrearEspecialidadInput = z.infer<typeof crearEspecialidadSchema>;
export type ActualizarEspecialidadInput = z.infer<
  typeof actualizarEspecialidadSchema
>;
export type AsignarEspecialidadInput = z.infer<typeof asignarEspecialidadSchema>;
