import { EstadoSimulacionLookIA } from "@prisma/client";
import { z } from "zod";
import { paginacionSchema, textoObligatorio, textoOpcional } from "./comun.validator";

const nombreEstiloSchema = textoObligatorio("nombre").max(
  120,
  "nombre no puede superar 120 caracteres"
);

const descripcionSchema = textoOpcional("descripcion").refine(
  (valor) => !valor || valor.length <= 500,
  "descripcion no puede superar 500 caracteres"
);

const promptBaseSchema = textoOpcional("promptBase").refine(
  (valor) => !valor || valor.length <= 1000,
  "promptBase no puede superar 1000 caracteres"
);

const imagenOriginalLookIASchema = z
  .string()
  .trim()
  .startsWith(
    "/uploads/lookia/originales/",
    "imagenOriginalUrl debe ser una ruta de LookIA válida"
  );

export const filtrosEstilosLookIASchema = z.object({
  ...paginacionSchema,
  idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional()
});

export const crearEstiloLookIASchema = z
  .object({
    nombre: nombreEstiloSchema,
    descripcion: descripcionSchema,
    idCategoriaCorte: z.string().uuid("idCategoriaCorte debe ser un UUID válido").optional(),
    promptBase: promptBaseSchema,
    imagenReferenciaUrl: z
      .string()
      .trim()
      .url("imagenReferenciaUrl debe ser una URL válida")
      .optional()
  })
  .strict();

export const actualizarEstiloLookIASchema = z
  .object({
    nombre: nombreEstiloSchema.optional(),
    descripcion: descripcionSchema,
    idCategoriaCorte: z
      .string()
      .uuid("idCategoriaCorte debe ser un UUID válido")
      .nullable()
      .optional(),
    promptBase: promptBaseSchema,
    imagenReferenciaUrl: z
      .string()
      .trim()
      .url("imagenReferenciaUrl debe ser una URL válida")
      .nullable()
      .optional(),
    activo: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar"
  });

export const crearSimulacionLookIASchema = z
  .object({
    idEstiloLookIA: z.string().uuid("idEstiloLookIA debe ser un UUID válido"),
    imagenOriginalUrl: imagenOriginalLookIASchema.optional(),
    consentimientoAceptado: z.literal(true, {
      error: "Debes aceptar el consentimiento para usar LookIA."
    })
  })
  .strict();

export const filtrosSimulacionesLookIASchema = z.object({
  ...paginacionSchema,
  estadoSimulacion: z.nativeEnum(EstadoSimulacionLookIA).optional()
});

export type FiltrosEstilosLookIAInput = z.infer<typeof filtrosEstilosLookIASchema>;
export type CrearEstiloLookIAInput = z.infer<typeof crearEstiloLookIASchema>;
export type ActualizarEstiloLookIAInput = z.infer<typeof actualizarEstiloLookIASchema>;
export type CrearSimulacionLookIAInput = z.infer<typeof crearSimulacionLookIASchema>;
export type FiltrosSimulacionesLookIAInput = z.infer<typeof filtrosSimulacionesLookIASchema>;
