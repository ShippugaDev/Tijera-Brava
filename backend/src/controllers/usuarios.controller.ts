import type { RequestHandler } from "express";
import { ErrorAplicacion } from "../errors/error-aplicacion";
import { obtenerArchivoFotoPerfil } from "../middlewares/subida-foto-perfil.middleware";
import { subirImagenASupabaseStorage } from "../services/storage.service";
import { usuariosService } from "../services/usuarios.service";
import type {
  ActualizarPerfilGeneralInput,
  CambiarEstadoUsuarioInput,
  FiltrosUsuariosInput
} from "../validators/usuarios.validator";

export const obtenerMiPerfil: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await usuariosService.obtenerMiPerfil(
      req.usuario!.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Perfil consultado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarMiPerfil: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await usuariosService.actualizarMiPerfil(
      req.usuario!.idUsuario,
      req.body as ActualizarPerfilGeneralInput
    );

    res.json({
      exito: true,
      mensaje: "Perfil actualizado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarMiFotografia: RequestHandler = async (req, res, next) => {
  try {
    const archivo = obtenerArchivoFotoPerfil(req.files);

    if (!archivo) {
      throw new ErrorAplicacion("Selecciona una imagen para subir.", 400);
    }

    const carpetaPorRol: Record<string, string> = {
      ADMINISTRADOR: "administradores",
      BARBERO: "barberos",
      CLIENTE: "clientes"
    };
    const fotoPerfilUrl = await subirImagenASupabaseStorage({
      bucket: process.env.SUPABASE_STORAGE_BUCKET_PERFILES ?? "perfiles",
      carpeta: carpetaPorRol[req.usuario!.rol] ?? "usuarios",
      archivo,
      prefijo: req.usuario!.idUsuario
    });
    const usuario = await usuariosService.actualizarFotoPerfil(
      req.usuario!.idUsuario,
      fotoPerfilUrl
    );

    res.json({
      exito: true,
      mensaje: "Foto de perfil actualizada correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const listarUsuarios: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await usuariosService.listarUsuarios(
      req.query as unknown as FiltrosUsuariosInput
    );

    res.json({
      exito: true,
      mensaje: "Usuarios consultados correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerUsuarioPorId: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await usuariosService.obtenerUsuarioPorId(
      req.params.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Usuario consultado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const cambiarEstadoUsuario: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await usuariosService.cambiarEstadoUsuario(
      req.usuario!.idUsuario,
      req.params.idUsuario,
      req.body as CambiarEstadoUsuarioInput
    );

    res.json({
      exito: true,
      mensaje: "Estado de usuario actualizado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};
