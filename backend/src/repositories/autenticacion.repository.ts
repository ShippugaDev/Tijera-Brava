import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const usuarioSeguroSelect = {
  idUsuario: true,
  nombres: true,
  apellidos: true,
  correo: true,
  fotoPerfilUrl: true,
  estadoCuenta: true,
  rol: {
    select: {
      nombre: true
    }
  }
} satisfies Prisma.UsuarioSelect;

export type UsuarioSeguro = Prisma.UsuarioGetPayload<{
  select: typeof usuarioSeguroSelect;
}>;

export const autenticacionRepository = {
  buscarRolPorNombre(nombre: string) {
    return prisma.rol.findUnique({
      where: { nombre }
    });
  },

  buscarUsuarioPorCorreo(correo: string) {
    return prisma.usuario.findUnique({
      where: { correo },
      include: {
        rol: true
      }
    });
  },

  buscarUsuarioSeguroPorId(idUsuario: string) {
    return prisma.usuario.findUnique({
      where: { idUsuario },
      select: usuarioSeguroSelect
    });
  },

  actualizarUltimoAcceso(idUsuario: string) {
    return prisma.usuario.update({
      where: { idUsuario },
      data: {
        ultimoAcceso: new Date()
      }
    });
  },

  crearClienteConUsuario(
    tx: Prisma.TransactionClient,
    data: {
      idRol: number;
      nombres: string;
      apellidos: string;
      correo: string;
      telefono: string;
      contrasenaHash: string;
    }
  ) {
    return tx.usuario.create({
      data: {
        idRol: data.idRol,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        contrasenaHash: data.contrasenaHash,
        estadoCuenta: "ACTIVO",
        correoVerificado: false,
        cliente: {
          create: {}
        }
      },
      select: usuarioSeguroSelect
    });
  },

  crearBarberoConUsuario(
    tx: Prisma.TransactionClient,
    data: {
      idRol: number;
      nombres: string;
      apellidos: string;
      correo: string;
      telefono: string;
      contrasenaHash: string;
      nombreProfesional: string;
      biografia?: string;
      anosExperiencia: number;
    }
  ) {
    return tx.usuario.create({
      data: {
        idRol: data.idRol,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        contrasenaHash: data.contrasenaHash,
        estadoCuenta: "ACTIVO",
        correoVerificado: false,
        barbero: {
          create: {
            nombreProfesional: data.nombreProfesional,
            biografia: data.biografia,
            anosExperiencia: data.anosExperiencia,
            estadoAprobacion: "PENDIENTE",
            disponible: false
          }
        }
      },
      select: usuarioSeguroSelect
    });
  }
};
