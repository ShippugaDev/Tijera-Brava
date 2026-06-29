import type { Prisma } from "@prisma/client";
import { EstadoCuenta } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarPerfilGeneralInput,
  FiltrosUsuariosInput
} from "../validators/usuarios.validator";

const usuarioPerfilSelect = {
  idUsuario: true,
  nombres: true,
  apellidos: true,
  correo: true,
  telefono: true,
  fotoPerfilUrl: true,
  estadoCuenta: true,
  ultimoAcceso: true,
  fechaCreacion: true,
  rol: {
    select: {
      nombre: true
    }
  }
} satisfies Prisma.UsuarioSelect;

const usuarioDetalleSelect = {
  ...usuarioPerfilSelect,
  cliente: true,
  barbero: true
} satisfies Prisma.UsuarioSelect;

const construirWhereUsuarios = (filtros: FiltrosUsuariosInput) => {
  const where: Prisma.UsuarioWhereInput = {};

  if (filtros.estado) {
    where.estadoCuenta = filtros.estado;
  }

  if (filtros.rol) {
    where.rol = {
      nombre: filtros.rol
    };
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombres: { contains: filtros.busqueda, mode: "insensitive" } },
      { apellidos: { contains: filtros.busqueda, mode: "insensitive" } },
      { correo: { contains: filtros.busqueda, mode: "insensitive" } }
    ];
  }

  return where;
};

export type UsuarioPerfil = Prisma.UsuarioGetPayload<{
  select: typeof usuarioPerfilSelect;
}>;

export const usuariosRepository = {
  buscarPerfilPorId(idUsuario: string) {
    return prisma.usuario.findUnique({
      where: { idUsuario },
      select: usuarioPerfilSelect
    });
  },

  actualizarPerfil(idUsuario: string, data: ActualizarPerfilGeneralInput) {
    return prisma.usuario.update({
      where: { idUsuario },
      data,
      select: usuarioPerfilSelect
    });
  },

  actualizarFotoPerfil(idUsuario: string, fotoPerfilUrl: string) {
    return prisma.usuario.update({
      where: { idUsuario },
      data: { fotoPerfilUrl },
      select: usuarioPerfilSelect
    });
  },

  async listarUsuarios(filtros: FiltrosUsuariosInput) {
    const where = construirWhereUsuarios(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [usuarios, totalRegistros] = await prisma.$transaction([
      prisma.usuario.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: usuarioPerfilSelect
      }),
      prisma.usuario.count({ where })
    ]);

    return { usuarios, totalRegistros };
  },

  buscarDetallePorId(idUsuario: string) {
    return prisma.usuario.findUnique({
      where: { idUsuario },
      select: usuarioDetalleSelect
    });
  },

  buscarUsuarioConRol(idUsuario: string) {
    return prisma.usuario.findUnique({
      where: { idUsuario },
      include: { rol: true }
    });
  },

  contarAdministradoresActivosExcepto(idUsuario: string) {
    return prisma.usuario.count({
      where: {
        idUsuario: { not: idUsuario },
        estadoCuenta: EstadoCuenta.ACTIVO,
        rol: { nombre: "ADMINISTRADOR" }
      }
    });
  },

  cambiarEstado(idUsuario: string, estadoCuenta: EstadoCuenta) {
    return prisma.usuario.update({
      where: { idUsuario },
      data: { estadoCuenta },
      select: usuarioPerfilSelect
    });
  }
};
