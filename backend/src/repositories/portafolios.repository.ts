import type { Prisma } from "@prisma/client";
import { EstadoVisibilidadPortafolio } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarPortafolioInput,
  CrearPortafolioInput,
  FiltrosMiPortafolioInput,
  FiltrosPortafolioPublicoInput,
  ModerarPortafolioInput
} from "../validators/portafolios.validator";

const portafolioInclude = {
  categoriaCorte: {
    select: {
      idCategoriaCorte: true,
      nombre: true,
      slug: true,
      activa: true
    }
  },
  barbero: {
    include: {
      usuario: {
        select: {
          idUsuario: true,
          estadoCuenta: true
        }
      }
    }
  }
} satisfies Prisma.PortafolioCorteInclude;

export type PortafolioDetalle = Prisma.PortafolioCorteGetPayload<{
  include: typeof portafolioInclude;
}>;

export const portafoliosRepository = {
  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  buscarBarberoPublico(idBarbero: string) {
    return prisma.barbero.findUnique({
      where: { idBarbero },
      include: { usuario: true }
    });
  },

  buscarCategoriaActiva(idCategoriaCorte: string) {
    return prisma.categoriaCorte.findFirst({
      where: { idCategoriaCorte, activa: true }
    });
  },

  async listarPublico(idBarbero: string, filtros: FiltrosPortafolioPublicoInput) {
    const where: Prisma.PortafolioCorteWhereInput = {
      idBarbero,
      estadoVisibilidad: EstadoVisibilidadPortafolio.VISIBLE,
      OR: [{ idCategoriaCorte: null }, { categoriaCorte: { activa: true } }]
    };

    if (filtros.idCategoriaCorte) where.idCategoriaCorte = filtros.idCategoriaCorte;
    if (filtros.destacado !== undefined) where.destacado = filtros.destacado;

    const skip = (filtros.pagina - 1) * filtros.limite;
    const [portafolios, totalRegistros] = await prisma.$transaction([
      prisma.portafolioCorte.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: [{ destacado: "desc" }, { fechaCreacion: "desc" }],
        include: portafolioInclude
      }),
      prisma.portafolioCorte.count({ where })
    ]);

    return { portafolios, totalRegistros };
  },

  async listarPropio(idBarbero: string, filtros: FiltrosMiPortafolioInput) {
    const where: Prisma.PortafolioCorteWhereInput = { idBarbero };
    if (filtros.estadoVisibilidad) where.estadoVisibilidad = filtros.estadoVisibilidad;
    if (filtros.idCategoriaCorte) where.idCategoriaCorte = filtros.idCategoriaCorte;

    const skip = (filtros.pagina - 1) * filtros.limite;
    const [portafolios, totalRegistros] = await prisma.$transaction([
      prisma.portafolioCorte.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        include: portafolioInclude
      }),
      prisma.portafolioCorte.count({ where })
    ]);

    return { portafolios, totalRegistros };
  },

  crear(idBarbero: string, data: CrearPortafolioInput & { imagenUrl: string }) {
    return prisma.portafolioCorte.create({
      data: {
        idBarbero,
        titulo: data.titulo,
        descripcion: data.descripcion,
        imagenUrl: data.imagenUrl,
        idCategoriaCorte: data.idCategoriaCorte,
        destacado: data.destacado ?? false,
        estadoVisibilidad: EstadoVisibilidadPortafolio.VISIBLE
      },
      include: portafolioInclude
    });
  },

  buscarPorId(idPortafolioCorte: string) {
    return prisma.portafolioCorte.findUnique({
      where: { idPortafolioCorte },
      include: portafolioInclude
    });
  },

  actualizar(idPortafolioCorte: string, data: ActualizarPortafolioInput) {
    return prisma.portafolioCorte.update({
      where: { idPortafolioCorte },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        imagenUrl: data.imagenUrl,
        idCategoriaCorte: data.idCategoriaCorte,
        destacado: data.destacado
      },
      include: portafolioInclude
    });
  },

  eliminar(idPortafolioCorte: string) {
    return prisma.portafolioCorte.update({
      where: { idPortafolioCorte },
      data: { estadoVisibilidad: EstadoVisibilidadPortafolio.ELIMINADO },
      include: portafolioInclude
    });
  },

  moderar(idPortafolioCorte: string, data: ModerarPortafolioInput) {
    return prisma.portafolioCorte.update({
      where: { idPortafolioCorte },
      data: {
        estadoVisibilidad: data.estadoVisibilidad,
        motivoModeracion:
          data.estadoVisibilidad === EstadoVisibilidadPortafolio.VISIBLE
            ? null
            : data.motivoModeracion
      },
      include: portafolioInclude
    });
  }
};
