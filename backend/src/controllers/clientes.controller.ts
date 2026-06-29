import type { RequestHandler } from "express";
import { clientesService } from "../services/clientes.service";
import type { ActualizarPerfilClienteInput } from "../validators/clientes.validator";

export const obtenerMiPerfilCliente: RequestHandler = async (req, res, next) => {
  try {
    const datos = await clientesService.obtenerMiPerfil(req.usuario!.idUsuario);

    res.json({
      exito: true,
      mensaje: "Perfil de cliente consultado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarMiPerfilCliente: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const datos = await clientesService.actualizarMiPerfil(
      req.usuario!.idUsuario,
      req.body as ActualizarPerfilClienteInput
    );

    res.json({
      exito: true,
      mensaje: "Perfil de cliente actualizado correctamente",
      datos
    });
  } catch (error) {
    next(error);
  }
};
