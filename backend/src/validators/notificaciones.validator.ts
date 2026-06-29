import { TipoNotificacion } from "@prisma/client";
import { z } from "zod";

export const filtrosNotificacionesSchema = z.object({
  leida: z
    .preprocess((valor) => {
      if (valor === undefined) return undefined;
      if (valor === "true") return true;
      if (valor === "false") return false;
      return valor;
    }, z.boolean().optional()),
  tipo: z.nativeEnum(TipoNotificacion).optional(),
  pagina: z.preprocess(
    (valor) => (valor === undefined ? 1 : Number(valor)),
    z.number().int().min(1)
  ),
  limite: z
    .preprocess(
      (valor) => (valor === undefined ? 20 : Number(valor)),
      z.number().int().min(1)
    )
    .transform((limite) => Math.min(limite, 50))
});

export type FiltrosNotificacionesInput = z.infer<typeof filtrosNotificacionesSchema>;
