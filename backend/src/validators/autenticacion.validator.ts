import { z } from "zod";

const contrasenaSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número")
  .regex(/[^A-Za-z0-9]/, "La contraseña debe incluir al menos un símbolo");

const textoObligatorio = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} es obligatorio`);

const correoSchema = z
  .string()
  .trim()
  .email("El correo no tiene un formato válido")
  .transform((correo) => correo.toLowerCase());

export const registroClienteSchema = z.object({
  nombres: textoObligatorio("nombres"),
  apellidos: textoObligatorio("apellidos"),
  correo: correoSchema,
  telefono: textoObligatorio("telefono"),
  contrasena: contrasenaSchema
});

export const registroBarberoSchema = registroClienteSchema.extend({
  nombreProfesional: textoObligatorio("nombreProfesional"),
  biografia: z.string().trim().optional(),
  anosExperiencia: z
    .number({ message: "anosExperiencia debe ser un número" })
    .int("anosExperiencia debe ser un entero")
    .min(0, "anosExperiencia no puede ser negativo")
});

export const iniciarSesionSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(1, "La contraseña es obligatoria")
});

export type RegistroClienteInput = z.infer<typeof registroClienteSchema>;
export type RegistroBarberoInput = z.infer<typeof registroBarberoSchema>;
export type IniciarSesionInput = z.infer<typeof iniciarSesionSchema>;
