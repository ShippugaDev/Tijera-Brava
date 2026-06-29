import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  clientesRepository,
  type ClientePerfil
} from "../repositories/clientes.repository";
import type { ActualizarPerfilClienteInput } from "../validators/clientes.validator";

const formatearCliente = (cliente: ClientePerfil) => ({
  usuario: {
    idUsuario: cliente.usuario.idUsuario,
    nombres: cliente.usuario.nombres,
    apellidos: cliente.usuario.apellidos,
    correo: cliente.usuario.correo,
    telefono: cliente.usuario.telefono,
    estadoCuenta: cliente.usuario.estadoCuenta,
    rol: cliente.usuario.rol.nombre
  },
  cliente: {
    idCliente: cliente.idCliente,
    fechaNacimiento: cliente.fechaNacimiento,
    estiloPreferido: cliente.estiloPreferido,
    fechaCreacion: cliente.fechaCreacion,
    fechaActualizacion: cliente.fechaActualizacion
  }
});

export const clientesService = {
  async obtenerMiPerfil(idUsuario: string) {
    const cliente = await clientesRepository.buscarPerfilPorUsuario(idUsuario);

    if (!cliente) {
      throw new ErrorAplicacion("Perfil de cliente no encontrado", 404);
    }

    return formatearCliente(cliente);
  },

  async actualizarMiPerfil(
    idUsuario: string,
    data: ActualizarPerfilClienteInput
  ) {
    const clienteExistente =
      await clientesRepository.buscarPerfilPorUsuario(idUsuario);

    if (!clienteExistente) {
      throw new ErrorAplicacion("Perfil de cliente no encontrado", 404);
    }

    const cliente = await clientesRepository.actualizarPerfil(idUsuario, data);

    return formatearCliente(cliente);
  }
};
