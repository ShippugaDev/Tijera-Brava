import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarCategoriaCorteInput,
  CrearCategoriaCorteInput,
  FiltrosCategoriasCortesInput
} from "../validators/categorias-cortes.validator";

const categoriaSelect = {
  idCategoriaCorte: true,
  nombre: true,
  slug: true,
  descripcion: true,
  activa: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.CategoriaCorteSelect;

const construirWhere = (filtros: FiltrosCategoriasCortesInput) => {
  const where: Prisma.CategoriaCorteWhereInput = { activa: true };

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
      { descripcion: { contains: filtros.busqueda, mode: "insensitive" } }
    ];
  }

  return where;
};

export type CategoriaCorteDetalle = Prisma.CategoriaCorteGetPayload<{
  select: typeof categoriaSelect;
}>;

export const categoriasCortesRepository = {
  async listar(filtros: FiltrosCategoriasCortesInput) {
    const where = construirWhere(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [categorias, totalRegistros] = await prisma.$transaction([
      prisma.categoriaCorte.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: categoriaSelect
      }),
      prisma.categoriaCorte.count({ where })
    ]);

    return { categorias, totalRegistros };
  },

  buscarActivaPorId(idCategoriaCorte: string) {
    return prisma.categoriaCorte.findFirst({
      where: { idCategoriaCorte, activa: true },
      select: categoriaSelect
    });
  },

  buscarPorId(idCategoriaCorte: string) {
    return prisma.categoriaCorte.findUnique({
      where: { idCategoriaCorte },
      select: categoriaSelect
    });
  },

  buscarPorSlug(slug: string) {
    return prisma.categoriaCorte.findUnique({ where: { slug }, select: categoriaSelect });
  },

  buscarOtraPorSlug(slug: string, idCategoriaCorte: string) {
    return prisma.categoriaCorte.findFirst({
      where: { slug, idCategoriaCorte: { not: idCategoriaCorte } },
      select: categoriaSelect
    });
  },

  crear(data: CrearCategoriaCorteInput & { slug: string }) {
    return prisma.categoriaCorte.create({ data, select: categoriaSelect });
  },

  actualizar(idCategoriaCorte: string, data: ActualizarCategoriaCorteInput & { slug?: string }) {
    return prisma.categoriaCorte.update({
      where: { idCategoriaCorte },
      data,
      select: categoriaSelect
    });
  },

  desactivar(idCategoriaCorte: string) {
    return prisma.categoriaCorte.update({
      where: { idCategoriaCorte },
      data: { activa: false },
      select: categoriaSelect
    });
  }
};
