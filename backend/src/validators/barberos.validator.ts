import { z } from "zod";

const textoOpcional = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} no puede estar vacío`)
    .optional();

const enteroPositivoDesdeQuery = (valorPorDefecto: number) =>
  z
    .preprocess(
      (valor) => (valor === undefined ? valorPorDefecto : Number(valor)),
      z.number().int().min(1)
    );

export const actualizarPerfilBarberoSchema = z
  .object({
    nombreProfesional: textoOpcional("nombreProfesional"),
    biografia: textoOpcional("biografia"),
    anosExperiencia: z
      .number({ message: "anosExperiencia debe ser un número" })
      .int("anosExperiencia debe ser un entero")
      .min(0, "anosExperiencia no puede ser negativo")
      .optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo permitido para actualizar"
  });

export const filtrosBarberosPendientesSchema = z.object({
  busqueda: textoOpcional("busqueda"),
  pagina: enteroPositivoDesdeQuery(1),
  limite: enteroPositivoDesdeQuery(10).transform((limite) =>
    Math.min(limite, 50)
  )
});

export const filtrosBarberosPublicosSchema = z.object({
  busqueda: textoOpcional("busqueda"),
  distrito: textoOpcional("distrito"),
  servicio: textoOpcional("servicio"),
  especialidad: textoOpcional("especialidad"),
  calificacion_minima: z
    .preprocess(
      (valor) => (valor === undefined || valor === "" ? undefined : Number(valor)),
      z.number().min(0).max(5).optional()
    ),
  disponible: z.preprocess((valor) => {
    if (valor === undefined) return undefined;
    if (valor === "true") return true;
    if (valor === "false") return false;
    return valor;
  }, z.boolean().optional()),
  pagina: enteroPositivoDesdeQuery(1),
  limite: enteroPositivoDesdeQuery(12).transform((limite) =>
    Math.min(limite, 50)
  )
});

export const rechazarBarberoSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo es obligatorio")
});

export type ActualizarPerfilBarberoInput = z.infer<
  typeof actualizarPerfilBarberoSchema
>;
export type FiltrosBarberosPendientesInput = z.infer<
  typeof filtrosBarberosPendientesSchema
>;
export type FiltrosBarberosPublicosInput = z.infer<
  typeof filtrosBarberosPublicosSchema
>;
export type RechazarBarberoInput = z.infer<typeof rechazarBarberoSchema>;
