import bcrypt from "bcrypt";
import { EstadoCuenta } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  autenticacionRepository,
  type UsuarioSeguro
} from "../repositories/autenticacion.repository";
import { generarTokenSesion } from "../utils/jwt";
import type {
  IniciarSesionInput,
  RegistroBarberoInput,
  RegistroClienteInput
} from "../validators/autenticacion.validator";

const saltRounds = 10;

const formatearUsuarioSeguro = (usuario: UsuarioSeguro) => ({
  idUsuario: usuario.idUsuario,
  nombres: usuario.nombres,
  apellidos: usuario.apellidos,
  correo: usuario.correo,
  fotoPerfilUrl: usuario.fotoPerfilUrl,
  rol: usuario.rol.nombre
});

const verificarCuentaActiva = (estadoCuenta: EstadoCuenta) => {
  if (
    estadoCuenta === EstadoCuenta.INACTIVO ||
    estadoCuenta === EstadoCuenta.SUSPENDIDO
  ) {
    throw new ErrorAplicacion("La cuenta no está habilitada", 403);
  }
};

export const autenticacionService = {
  async registrarCliente(data: RegistroClienteInput) {
    const usuarioExistente =
      await autenticacionRepository.buscarUsuarioPorCorreo(data.correo);

    if (usuarioExistente) {
      throw new ErrorAplicacion("El correo ya está registrado", 409);
    }

    const rolCliente = await autenticacionRepository.buscarRolPorNombre(
      "CLIENTE"
    );

    if (!rolCliente) {
      throw new ErrorAplicacion("Rol CLIENTE no configurado", 500);
    }

    const contrasenaHash = await bcrypt.hash(data.contrasena, saltRounds);

    const usuario = await prisma.$transaction((tx) =>
      autenticacionRepository.crearClienteConUsuario(tx, {
        idRol: rolCliente.idRol,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        contrasenaHash
      })
    );

    return formatearUsuarioSeguro(usuario);
  },

  async registrarBarbero(data: RegistroBarberoInput) {
    const usuarioExistente =
      await autenticacionRepository.buscarUsuarioPorCorreo(data.correo);

    if (usuarioExistente) {
      throw new ErrorAplicacion("El correo ya está registrado", 409);
    }

    const rolBarbero = await autenticacionRepository.buscarRolPorNombre(
      "BARBERO"
    );

    if (!rolBarbero) {
      throw new ErrorAplicacion("Rol BARBERO no configurado", 500);
    }

    const contrasenaHash = await bcrypt.hash(data.contrasena, saltRounds);

    const usuario = await prisma.$transaction((tx) =>
      autenticacionRepository.crearBarberoConUsuario(tx, {
        idRol: rolBarbero.idRol,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        contrasenaHash,
        nombreProfesional: data.nombreProfesional,
        biografia: data.biografia,
        anosExperiencia: data.anosExperiencia
      })
    );

    return formatearUsuarioSeguro(usuario);
  },

  async iniciarSesion(data: IniciarSesionInput) {
    const usuario = await autenticacionRepository.buscarUsuarioPorCorreo(
      data.correo
    );

    if (!usuario) {
      throw new ErrorAplicacion("Credenciales inválidas", 401);
    }

    verificarCuentaActiva(usuario.estadoCuenta);

    const contrasenaValida = await bcrypt.compare(
      data.contrasena,
      usuario.contrasenaHash
    );

    if (!contrasenaValida) {
      throw new ErrorAplicacion("Credenciales inválidas", 401);
    }

    await autenticacionRepository.actualizarUltimoAcceso(usuario.idUsuario);

    const token = generarTokenSesion({
      idUsuario: usuario.idUsuario,
      rol: usuario.rol.nombre
    });

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        fotoPerfilUrl: usuario.fotoPerfilUrl,
        rol: usuario.rol.nombre
      }
    };
  },

  async obtenerSesionActual(idUsuario: string) {
    const usuario = await autenticacionRepository.buscarUsuarioSeguroPorId(
      idUsuario
    );

    if (!usuario) {
      throw new ErrorAplicacion("Sesión inválida", 401);
    }

    verificarCuentaActiva(usuario.estadoCuenta);

    return formatearUsuarioSeguro(usuario);
  }
};
