import { z } from "zod";

const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

const limiteSchema = (valorPorDefecto = 10) =>
  z
  .preprocess(
    (valor) => (valor === undefined ? valorPorDefecto : Number(valor)),
    z.number().int().min(1)
  )
  .transform((limite) => Math.min(limite, 50));

const validarRangoFechas = <T extends { desde?: string; hasta?: string }>(data: T) =>
  !data.desde || !data.hasta || data.desde <= data.hasta;

export const filtrosReservasAdminSchema = z
  .object({
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    agruparPor: z.enum(["dia", "mes", "estado", "barbero", "servicio"]).default("estado")
  })
  .refine(validarRangoFechas, {
    message: "desde no puede ser mayor que hasta"
  });

export const filtrosPagosAdminSchema = z
  .object({
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    agruparPor: z.enum(["estado", "metodo", "mes"]).default("estado")
  })
  .refine(validarRangoFechas, {
    message: "desde no puede ser mayor que hasta"
  });

export const filtrosServiciosAdminSchema = z
  .object({
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    limite: limiteSchema()
  })
  .refine(validarRangoFechas, {
    message: "desde no puede ser mayor que hasta"
  });

export const filtrosBarberosAdminSchema = z
  .object({
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    limite: limiteSchema(),
    ordenarPor: z.enum(["reservas", "calificacion", "ingresos", "portafolio"]).default("reservas")
  })
  .refine(validarRangoFechas, {
    message: "desde no puede ser mayor que hasta"
  });

export const filtrosLookIAAdminSchema = z
  .object({
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    agruparPor: z.enum(["estado", "estilo", "categoria", "mes"]).default("estado")
  })
  .refine(validarRangoFechas, {
    message: "desde no puede ser mayor que hasta"
  });

export const filtrosActividadRecienteAdminSchema = z.object({
  limite: limiteSchema(20)
});

export const filtrosModeracionAdminSchema = z.object({
  limite: limiteSchema(50)
});

export type FiltrosReservasAdminInput = z.infer<typeof filtrosReservasAdminSchema>;
export type FiltrosPagosAdminInput = z.infer<typeof filtrosPagosAdminSchema>;
export type FiltrosServiciosAdminInput = z.infer<typeof filtrosServiciosAdminSchema>;
export type FiltrosBarberosAdminInput = z.infer<typeof filtrosBarberosAdminSchema>;
export type FiltrosLookIAAdminInput = z.infer<typeof filtrosLookIAAdminSchema>;
export type FiltrosActividadRecienteAdminInput = z.infer<
  typeof filtrosActividadRecienteAdminSchema
>;
export type FiltrosModeracionAdminInput = z.infer<typeof filtrosModeracionAdminSchema>;
