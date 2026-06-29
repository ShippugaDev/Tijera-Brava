import { EstadoVisibilidadCalificacion } from "@prisma/client";
import { z } from "zod";
import { paginacionSchema, textoOpcional } from "./comun.validator";

const comentarioSchema = textoOpcional("comentario").refine(
  (valor) => !valor || valor.length <= 500,
  "comentario no puede superar 500 caracteres"
);

const motivoModeracionSchema = textoOpcional("motivoModeracion").refine(
  (valor) => !valor || valor.length <= 300,
  "motivoModeracion no puede superar 300 caracteres"
);

export const crearCalificacionSchema = z.object({
  idReserva: z.string().uuid("idReserva debe ser un UUID válido"),
  puntuacion: z
    .number({ message: "puntuacion debe ser un número" })
    .int("puntuacion debe ser un entero")
    .min(1, "puntuacion debe ser al menos 1")
    .max(5, "puntuacion debe ser máximo 5"),
  comentario: comentarioSchema
});

export const filtrosCalificacionesPublicasSchema = z.object({
  ...paginacionSchema,
  puntuacion: z
    .preprocess(
      (valor) => (valor === undefined ? undefined : Number(valor)),
      z.number().int().min(1).max(5).optional()
    )
});

export const filtrosMisCalificacionesSchema = z.object(paginacionSchema);

export const moderarCalificacionSchema = z
  .object({
    estadoVisibilidad: z.nativeEnum(EstadoVisibilidadCalificacion),
    motivoModeracion: motivoModeracionSchema
  })
  .refine(
    (data) =>
      data.estadoVisibilidad !== EstadoVisibilidadCalificacion.OCULTA ||
      Boolean(data.motivoModeracion),
    { message: "motivoModeracion es obligatorio al ocultar una calificación" }
  );

export type CrearCalificacionInput = z.infer<typeof crearCalificacionSchema>;
export type FiltrosCalificacionesPublicasInput = z.infer<
  typeof filtrosCalificacionesPublicasSchema
>;
export type FiltrosMisCalificacionesInput = z.infer<
  typeof filtrosMisCalificacionesSchema
>;
export type ModerarCalificacionInput = z.infer<typeof moderarCalificacionSchema>;
