import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { ActualizarPerfilClienteInput } from "../validators/clientes.validator";

const clientePerfilSelect = {
  idCliente: true,
  fechaNacimiento: true,
  estiloPreferido: true,
  fechaCreacion: true,
  fechaActualizacion: true,
  usuario: {
    select: {
      idUsuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
      telefono: true,
      estadoCuenta: true,
      rol: {
        select: {
          nombre: true
        }
      }
    }
  }
} satisfies Prisma.ClienteSelect;

export type ClientePerfil = Prisma.ClienteGetPayload<{
  select: typeof clientePerfilSelect;
}>;

export const clientesRepository = {
  buscarPerfilPorUsuario(idUsuario: string) {
    return prisma.cliente.findUnique({
      where: { idUsuario },
      select: clientePerfilSelect
    });
  },

  actualizarPerfil(idUsuario: string, data: ActualizarPerfilClienteInput) {
    return prisma.cliente.update({
      where: { idUsuario },
      data: {
        fechaNacimiento: data.fechaNacimiento
          ? new Date(`${data.fechaNacimiento}T00:00:00.000Z`)
          : undefined,
        estiloPreferido: data.estiloPreferido
      },
      select: clientePerfilSelect
    });
  }
};
