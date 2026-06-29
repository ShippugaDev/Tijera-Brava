import { z } from "zod";

const textoOpcional = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} no puede estar vacío`)
    .optional();

export const actualizarPerfilClienteSchema = z
  .object({
    fechaNacimiento: z
      .string()
      .trim()
      .date("fechaNacimiento debe tener formato YYYY-MM-DD")
      .optional(),
    estiloPreferido: textoOpcional("estiloPreferido")
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo permitido para actualizar"
  });

export type ActualizarPerfilClienteInput = z.infer<
  typeof actualizarPerfilClienteSchema
>;
