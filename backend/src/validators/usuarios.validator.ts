import { EstadoCuenta } from "@prisma/client";
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

export const actualizarPerfilGeneralSchema = z
  .object({
    nombres: z
      .string()
      .trim()
      .min(2, "nombres debe tener al menos 2 caracteres")
      .optional(),
    apellidos: textoOpcional("apellidos"),
    telefono: textoOpcional("telefono")
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo permitido para actualizar"
  });

export const filtrosUsuariosSchema = z.object({
  rol: z.enum(["ADMINISTRADOR", "CLIENTE", "BARBERO"]).optional(),
  estado: z.nativeEnum(EstadoCuenta).optional(),
  busqueda: textoOpcional("busqueda"),
  pagina: enteroPositivoDesdeQuery(1),
  limite: enteroPositivoDesdeQuery(10).transform((limite) =>
    Math.min(limite, 50)
  )
});

export const cambiarEstadoUsuarioSchema = z.object({
  estadoCuenta: z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO"]),
  motivo: textoOpcional("motivo")
});

export type ActualizarPerfilGeneralInput = z.infer<
  typeof actualizarPerfilGeneralSchema
>;
export type FiltrosUsuariosInput = z.infer<typeof filtrosUsuariosSchema>;
export type CambiarEstadoUsuarioInput = z.infer<
  typeof cambiarEstadoUsuarioSchema
>;
