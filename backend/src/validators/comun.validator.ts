import { z } from "zod";

export const uuidParam = (nombre: string) =>
  z.object({
    [nombre]: z.string().uuid(`${nombre} debe ser un UUID válido`)
  });

export const textoObligatorio = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} no puede estar vacío`);

export const textoOpcional = (campo: string) =>
  textoObligatorio(campo).optional();

export const paginacionSchema = {
  busqueda: textoOpcional("busqueda"),
  pagina: z.preprocess(
    (valor) => (valor === undefined ? 1 : Number(valor)),
    z.number().int().min(1)
  ),
  limite: z
    .preprocess(
      (valor) => (valor === undefined ? 10 : Number(valor)),
      z.number().int().min(1)
    )
    .transform((limite) => Math.min(limite, 50))
};
