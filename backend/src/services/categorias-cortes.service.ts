import { ErrorAplicacion } from "../errors/error-aplicacion";
import {
  categoriasCortesRepository,
  type CategoriaCorteDetalle
} from "../repositories/categorias-cortes.repository";
import { generarSlug } from "../utils/slug";
import type {
  ActualizarCategoriaCorteInput,
  CrearCategoriaCorteInput,
  FiltrosCategoriasCortesInput
} from "../validators/categorias-cortes.validator";

const formatearCategoria = (categoria: CategoriaCorteDetalle) => ({
  idCategoriaCorte: categoria.idCategoriaCorte,
  nombre: categoria.nombre,
  slug: categoria.slug,
  descripcion: categoria.descripcion,
  activa: categoria.activa,
  fechaCreacion: categoria.fechaCreacion,
  fechaActualizacion: categoria.fechaActualizacion
});

export const categoriasCortesService = {
  async listar(filtros: FiltrosCategoriasCortesInput) {
    const { categorias, totalRegistros } =
      await categoriasCortesRepository.listar(filtros);
    const totalPaginas = Math.ceil(totalRegistros / filtros.limite);

    return {
      datos: categorias.map(formatearCategoria),
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

  async obtener(idCategoriaCorte: string) {
    const categoria = await categoriasCortesRepository.buscarActivaPorId(idCategoriaCorte);

    if (!categoria) {
      throw new ErrorAplicacion("Categoría no encontrada", 404);
    }

    return formatearCategoria(categoria);
  },

  async crear(data: CrearCategoriaCorteInput) {
    const slug = generarSlug(data.nombre);
    const duplicada = await categoriasCortesRepository.buscarPorSlug(slug);

    if (duplicada) {
      throw new ErrorAplicacion("Ya existe una categoría con ese nombre", 409);
    }

    const categoria = await categoriasCortesRepository.crear({ ...data, slug });
    return formatearCategoria(categoria);
  },

  async actualizar(idCategoriaCorte: string, data: ActualizarCategoriaCorteInput) {
    const existente = await categoriasCortesRepository.buscarPorId(idCategoriaCorte);

    if (!existente) {
      throw new ErrorAplicacion("Categoría no encontrada", 404);
    }

    const dataActualizacion: ActualizarCategoriaCorteInput & { slug?: string } = {
      ...data
    };

    if (data.nombre) {
      const slug = generarSlug(data.nombre);
      const duplicada = await categoriasCortesRepository.buscarOtraPorSlug(
        slug,
        idCategoriaCorte
      );

      if (duplicada) {
        throw new ErrorAplicacion("Ya existe una categoría con ese nombre", 409);
      }

      dataActualizacion.slug = slug;
    }

    const categoria = await categoriasCortesRepository.actualizar(
      idCategoriaCorte,
      dataActualizacion
    );
    return formatearCategoria(categoria);
  },

  async desactivar(idCategoriaCorte: string) {
    const existente = await categoriasCortesRepository.buscarPorId(idCategoriaCorte);

    if (!existente) {
      throw new ErrorAplicacion("Categoría no encontrada", 404);
    }

    const categoria = await categoriasCortesRepository.desactivar(idCategoriaCorte);
    return formatearCategoria(categoria);
  }
};
