import { z } from "zod";
import { textoObligatorio, textoOpcional } from "./comun.validator";

const observacionOpcional = textoOpcional("observacion").refine(
  (valor) => !valor || valor.length <= 300,
  "observacion no puede superar 300 caracteres"
);

export const registrarComprobanteSchema = z.object({
  comprobanteUrl: z
    .string()
    .trim()
    .url("comprobanteUrl debe ser una URL válida"),
  codigoOperacion: textoOpcional("codigoOperacion").refine(
    (valor) => !valor || valor.length <= 50,
    "codigoOperacion no puede superar 50 caracteres"
  ),
  observacion: observacionOpcional
});

export const observacionOpcionalSchema = z.object({
  observacion: observacionOpcional
});

export const observacionObligatoriaSchema = z.object({
  observacion: textoObligatorio("observacion").max(
    300,
    "observacion no puede superar 300 caracteres"
  )
});

export type RegistrarComprobanteInput = z.infer<
  typeof registrarComprobanteSchema
>;
export type ObservacionOpcionalInput = z.infer<typeof observacionOpcionalSchema>;
export type ObservacionObligatoriaInput = z.infer<
  typeof observacionObligatoriaSchema
>;
