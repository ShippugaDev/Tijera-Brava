import type { RequestHandler } from "express";
import { portafoliosService } from "../services/portafolios.service";
import type {
  ActualizarPortafolioInput,
  CrearPortafolioInput,
  FiltrosMiPortafolioInput,
  FiltrosPortafolioPublicoInput,
  ModerarPortafolioInput
} from "../validators/portafolios.validator";

export const listarPortafolioPublico: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await portafoliosService.listarPublico(
      req.params.idBarbero,
      req.query as unknown as FiltrosPortafolioPublicoInput
    );
    res.json({
      exito: true,
      mensaje: "Portafolio consultado correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const listarMiPortafolio: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await portafoliosService.listarPropio(
      req.usuario!.idUsuario,
      req.query as unknown as FiltrosMiPortafolioInput
    );
    res.json({
      exito: true,
      mensaje: "Mi portafolio consultado correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const crearPortafolio: RequestHandler = async (req, res, next) => {
  try {
    const portafolio = await portafoliosService.crear(
      req.usuario!.idUsuario,
      req.body as CrearPortafolioInput,
      req.file
    );
    res.status(201).json({
      exito: true,
      mensaje: "Publicación creada correctamente",
      datos: { portafolio }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarPortafolio: RequestHandler = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log(
      "FILE:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            hasBuffer: Boolean(req.file.buffer)
          }
        : null
    );

    const portafolio = await portafoliosService.actualizar(
      req.usuario!.idUsuario,
      req.params.idPortafolioCorte,
      req.body as ActualizarPortafolioInput,
      req.file
    );
    res.json({
      exito: true,
      mensaje: "Publicación actualizada correctamente",
      datos: { portafolio }
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarPortafolio: RequestHandler = async (req, res, next) => {
  try {
    const portafolio = await portafoliosService.eliminar(
      req.usuario!.idUsuario,
      req.params.idPortafolioCorte
    );
    res.json({
      exito: true,
      mensaje: "Publicación eliminada correctamente",
      datos: { portafolio }
    });
  } catch (error) {
    next(error);
  }
};

export const moderarPortafolio: RequestHandler = async (req, res, next) => {
  try {
    const portafolio = await portafoliosService.moderar(
      req.params.idPortafolioCorte,
      req.body as ModerarPortafolioInput
    );
    res.json({
      exito: true,
      mensaje: "Publicación moderada correctamente",
      datos: { portafolio }
    });
  } catch (error) {
    next(error);
  }
};
