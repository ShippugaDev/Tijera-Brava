import type { RequestHandler } from "express";
import { categoriasCortesService } from "../services/categorias-cortes.service";
import type {
  ActualizarCategoriaCorteInput,
  CrearCategoriaCorteInput,
  FiltrosCategoriasCortesInput
} from "../validators/categorias-cortes.validator";

export const listarCategoriasCortes: RequestHandler = async (req, res, next) => {
  try {
    const resultado = await categoriasCortesService.listar(
      req.query as unknown as FiltrosCategoriasCortesInput
    );
    res.json({
      exito: true,
      mensaje: "Categorías consultadas correctamente",
      datos: resultado.datos,
      paginacion: resultado.paginacion
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerCategoriaCorte: RequestHandler = async (req, res, next) => {
  try {
    const categoria = await categoriasCortesService.obtener(req.params.idCategoriaCorte);
    res.json({
      exito: true,
      mensaje: "Categoría consultada correctamente",
      datos: { categoria }
    });
  } catch (error) {
    next(error);
  }
};

export const crearCategoriaCorte: RequestHandler = async (req, res, next) => {
  try {
    const categoria = await categoriasCortesService.crear(
      req.body as CrearCategoriaCorteInput
    );
    res.status(201).json({
      exito: true,
      mensaje: "Categoría creada correctamente",
      datos: { categoria }
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarCategoriaCorte: RequestHandler = async (req, res, next) => {
  try {
    const categoria = await categoriasCortesService.actualizar(
      req.params.idCategoriaCorte,
      req.body as ActualizarCategoriaCorteInput
    );
    res.json({
      exito: true,
      mensaje: "Categoría actualizada correctamente",
      datos: { categoria }
    });
  } catch (error) {
    next(error);
  }
};

export const desactivarCategoriaCorte: RequestHandler = async (req, res, next) => {
  try {
    const categoria = await categoriasCortesService.desactivar(
      req.params.idCategoriaCorte
    );
    res.json({
      exito: true,
      mensaje: "Categoría desactivada correctamente",
      datos: { categoria }
    });
  } catch (error) {
    next(error);
  }
};
