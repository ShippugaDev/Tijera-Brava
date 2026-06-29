import { EstadoCuenta } from "@prisma/client";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  usuariosRepository,
  type UsuarioPerfil
} from "../repositories/usuarios.repository";
import type {
  ActualizarPerfilGeneralInput,
  CambiarEstadoUsuarioInput,
  FiltrosUsuariosInput
} from "../validators/usuarios.validator";

const formatearUsuario = (usuario: UsuarioPerfil) => ({
  idUsuario: usuario.idUsuario,
  nombres: usuario.nombres,
  apellidos: usuario.apellidos,
  correo: usuario.correo,
  telefono: usuario.telefono,
  fotoPerfilUrl: usuario.fotoPerfilUrl,
  estadoCuenta: usuario.estadoCuenta,
  rol: usuario.rol.nombre,
  ultimoAcceso: usuario.ultimoAcceso,
  fechaCreacion: usuario.fechaCreacion
});

export const usuariosService = {
  async obtenerMiPerfil(idUsuario: string) {
    const usuario = await usuariosRepository.buscarPerfilPorId(idUsuario);

    if (!usuario) {
      throw new ErrorAplicacion("Usuario no encontrado", 404);
    }

    return formatearUsuario(usuario);
  },

  async actualizarMiPerfil(
    idUsuario: string,
    data: ActualizarPerfilGeneralInput
  ) {
    const usuario = await usuariosRepository.actualizarPerfil(idUsuario, data);

    return formatearUsuario(usuario);
  },

  async actualizarFotoPerfil(idUsuario: string, fotoPerfilUrl: string) {
    const usuario = await usuariosRepository.actualizarFotoPerfil(
      idUsuario,
      fotoPerfilUrl
    );

    return formatearUsuario(usuario);
  },

  async listarUsuarios(filtros: FiltrosUsuariosInput) {
    const { usuarios, totalRegistros } =
      await usuariosRepository.listarUsuarios(filtros);
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: usuarios.map((usuario) => ({
        idUsuario: usuario.idUsuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono,
        estadoCuenta: usuario.estadoCuenta,
        rol: usuario.rol.nombre,
        fechaCreacion: usuario.fechaCreacion
      })),
      paginacion: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        totalRegistros,
        totalPaginas,
        tieneSiguiente: filtros.pagina < totalPaginas,
        tieneAnterior: filtros.pagina > 1
      }
    };
  },

  async obtenerUsuarioPorId(idUsuario: string) {
    const usuario = await usuariosRepository.buscarDetallePorId(idUsuario);

    if (!usuario) {
      throw new ErrorAplicacion("Usuario no encontrado", 404);
    }

    return {
      ...formatearUsuario(usuario),
      cliente: usuario.cliente,
      barbero: usuario.barbero
    };
  },

  async cambiarEstadoUsuario(
    idAdministrador: string,
    idUsuario: string,
    data: CambiarEstadoUsuarioInput
  ) {
    if (idAdministrador === idUsuario) {
      throw new ErrorAplicacion(
        "No puedes cambiar el estado de tu propia cuenta",
        409
      );
    }

    const usuario = await usuariosRepository.buscarUsuarioConRol(idUsuario);

    if (!usuario) {
      throw new ErrorAplicacion("Usuario no encontrado", 404);
    }

    if (
      usuario.rol.nombre === "ADMINISTRADOR" &&
      usuario.estadoCuenta === EstadoCuenta.ACTIVO &&
      data.estadoCuenta !== EstadoCuenta.ACTIVO
    ) {
      const administradoresActivos =
        await usuariosRepository.contarAdministradoresActivosExcepto(idUsuario);

      if (administradoresActivos === 0) {
        throw new ErrorAplicacion(
          "No se puede dejar el sistema sin administradores activos",
          409
        );
      }
    }

    const usuarioActualizado = await usuariosRepository.cambiarEstado(
      idUsuario,
      data.estadoCuenta
    );

    return formatearUsuario(usuarioActualizado);
  }
};
