import { EstadoVisibilidadPortafolio } from "@prisma/client";
import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

const tituloSchema = textoObligatorio("titulo").max(
  120,
  "titulo no puede superar 120 caracteres"
);

const descripcionSchema = textoOpcional("descripcion").refine(
  (valor) => !valor || valor.length <= 500,
  "descripcion no puede superar 500 caracteres"
);

const motivoModeracionSchema = textoOpcional("motivoModeracion").refine(
  (valor) => !valor || valor.length <= 300,
  "motivoModeracion no puede superar 300 caracteres"
);

const imagenUrlInternaSchema = z
  .string()
  .trim()
  .startsWith("/uploads/portafolios/", "imagenUrl debe ser una ruta de portafolio válida");

export const filtrosPortafolioPublicoSchema = z.object({
  ...paginacionSchema,
  idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional(),
  destacado: z
    .preprocess((valor) => {
      if (valor === undefined) return undefined;
      if (valor === "true") return true;
      if (valor === "false") return false;
      return valor;
    }, z.boolean().optional())
});

export const filtrosMiPortafolioSchema = z.object({
  ...paginacionSchema,
  estadoVisibilidad: z.nativeEnum(EstadoVisibilidadPortafolio).optional(),
  idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional()
});

export const crearPortafolioSchema = z.object({
  titulo: tituloSchema,
  descripcion: descripcionSchema,
  imagenUrl: imagenUrlInternaSchema.optional(),
  idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional(),
  destacado: z.boolean().optional()
});

export const actualizarPortafolioSchema = z
  .object({
    titulo: tituloSchema.optional(),
    descripcion: descripcionSchema,
    imagenUrl: imagenUrlInternaSchema.optional(),
    idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional(),
    destacado: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const moderarPortafolioSchema = z
  .object({
    estadoVisibilidad: z.nativeEnum(EstadoVisibilidadPortafolio),
    motivoModeracion: motivoModeracionSchema
  })
  .refine(
    (data) =>
      data.estadoVisibilidad !== EstadoVisibilidadPortafolio.OCULTO ||
      Boolean(data.motivoModeracion),
    { message: "motivoModeracion es obligatorio al ocultar una publicación" }
  );

export type FiltrosPortafolioPublicoInput = z.infer<typeof filtrosPortafolioPublicoSchema>;
export type FiltrosMiPortafolioInput = z.infer<typeof filtrosMiPortafolioSchema>;
export type CrearPortafolioInput = z.infer<typeof crearPortafolioSchema>;
export type ActualizarPortafolioInput = z.infer<typeof actualizarPortafolioSchema>;
export type ModerarPortafolioInput = z.infer<typeof moderarPortafolioSchema>;
