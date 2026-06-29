import {
  EstadoAprobacion,
  EstadoCuenta,
  EstadoSimulacionLookIA,
  EstadoVisibilidadCalificacion,
  EstadoVisibilidadPortafolio,
  type Prisma
} from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarEstiloLookIAInput,
  CrearEstiloLookIAInput,
  CrearSimulacionLookIAInput,
  FiltrosEstilosLookIAInput,
  FiltrosSimulacionesLookIAInput
} from "../validators/lookia.validator";

const estiloInclude = {
  categoriaCorte: {
    select: {
      idCategoriaCorte: true,
      nombre: true,
      slug: true,
      activa: true
    }
  }
} satisfies Prisma.EstiloLookIAInclude;

const simulacionInclude = {
  estiloLookIA: {
    include: estiloInclude
  },
  cliente: {
    include: {
      usuario: {
        select: {
          idUsuario: true,
          estadoCuenta: true
        }
      }
    }
  }
} satisfies Prisma.SimulacionLookIAInclude;

export type EstiloLookIADetalle = Prisma.EstiloLookIAGetPayload<{
  include: typeof estiloInclude;
}>;

export type SimulacionLookIADetalle = Prisma.SimulacionLookIAGetPayload<{
  include: typeof simulacionInclude;
}>;

export const lookiaRepository = {
  buscarClientePorUsuario(idUsuario: string) {
    return prisma.cliente.findUnique({ where: { idUsuario }, include: { usuario: true } });
  },

  buscarCategoriaActiva(idCategoriaCorte: string) {
    return prisma.categoriaCorte.findFirst({
      where: { idCategoriaCorte, activa: true }
    });
  },

  buscarEstiloPorSlug(slug: string) {
    return prisma.estiloLookIA.findUnique({
      where: { slug },
      include: estiloInclude
    });
  },

  buscarEstiloActivo(idEstiloLookIA: string) {
    return prisma.estiloLookIA.findFirst({
      where: { idEstiloLookIA, activo: true },
      include: estiloInclude
    });
  },

  buscarEstiloPorId(idEstiloLookIA: string) {
    return prisma.estiloLookIA.findUnique({
      where: { idEstiloLookIA },
      include: estiloInclude
    });
  },

  async listarEstilosActivos(filtros: FiltrosEstilosLookIAInput) {
    const where: Prisma.EstiloLookIAWhereInput = {
      activo: true
    };

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
        { descripcion: { contains: filtros.busqueda, mode: "insensitive" } }
      ];
    }
    if (filtros.idCategoriaCorte) where.idCategoriaCorte = filtros.idCategoriaCorte;

    const skip = (filtros.pagina - 1) * filtros.limite;
    const [estilos, totalRegistros] = await prisma.$transaction([
      prisma.estiloLookIA.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        include: estiloInclude
      }),
      prisma.estiloLookIA.count({ where })
    ]);

    return { estilos, totalRegistros };
  },

  crearEstilo(data: CrearEstiloLookIAInput & { slug: string }) {
    return prisma.estiloLookIA.create({
      data: {
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion,
        idCategoriaCorte: data.idCategoriaCorte,
        promptBase: data.promptBase,
        imagenReferenciaUrl: data.imagenReferenciaUrl,
        activo: true
      },
      include: estiloInclude
    });
  },

  actualizarEstilo(idEstiloLookIA: string, data: ActualizarEstiloLookIAInput & { slug?: string }) {
    return prisma.estiloLookIA.update({
      where: { idEstiloLookIA },
      data: {
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion,
        idCategoriaCorte: data.idCategoriaCorte,
        promptBase: data.promptBase,
        imagenReferenciaUrl: data.imagenReferenciaUrl,
        activo: data.activo
      },
      include: estiloInclude
    });
  },

  desactivarEstilo(idEstiloLookIA: string) {
    return prisma.estiloLookIA.update({
      where: { idEstiloLookIA },
      data: { activo: false },
      include: estiloInclude
    });
  },

  async crearSimulacionProcesada(
    idCliente: string,
    data: CrearSimulacionLookIAInput & { imagenOriginalUrl: string },
    construirUrlResultado: (idSimulacionLookIA: string) => string
  ) {
    return prisma.$transaction(async (tx) => {
      const simulacion = await tx.simulacionLookIA.create({
        data: {
          idCliente,
          idEstiloLookIA: data.idEstiloLookIA,
          imagenOriginalUrl: data.imagenOriginalUrl,
          consentimientoAceptado: data.consentimientoAceptado,
          estadoSimulacion: EstadoSimulacionLookIA.PROCESANDO
        }
      });

      return tx.simulacionLookIA.update({
        where: { idSimulacionLookIA: simulacion.idSimulacionLookIA },
        data: {
          estadoSimulacion: EstadoSimulacionLookIA.COMPLETADA,
          imagenResultadoUrl: construirUrlResultado(simulacion.idSimulacionLookIA),
          fechaProcesamiento: new Date()
        },
        include: simulacionInclude
      });
    });
  },

  buscarSimulacionPorId(idSimulacionLookIA: string) {
    return prisma.simulacionLookIA.findUnique({
      where: { idSimulacionLookIA },
      include: simulacionInclude
    });
  },

  async listarSimulaciones(idCliente: string, filtros: FiltrosSimulacionesLookIAInput) {
    const where: Prisma.SimulacionLookIAWhereInput = {
      idCliente,
      estadoSimulacion:
        filtros.estadoSimulacion ?? { not: EstadoSimulacionLookIA.ELIMINADA }
    };

    const skip = (filtros.pagina - 1) * filtros.limite;
    const [simulaciones, totalRegistros] = await prisma.$transaction([
      prisma.simulacionLookIA.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        include: simulacionInclude
      }),
      prisma.simulacionLookIA.count({ where })
    ]);

    return { simulaciones, totalRegistros };
  },

  regenerarSimulacion(idSimulacionLookIA: string, imagenResultadoUrl: string) {
    return prisma.simulacionLookIA.update({
      where: { idSimulacionLookIA },
      data: {
        estadoSimulacion: EstadoSimulacionLookIA.COMPLETADA,
        imagenResultadoUrl,
        mensajeError: null,
        fechaProcesamiento: new Date()
      },
      include: simulacionInclude
    });
  },

  eliminarSimulacion(idSimulacionLookIA: string) {
    return prisma.simulacionLookIA.update({
      where: { idSimulacionLookIA },
      data: { estadoSimulacion: EstadoSimulacionLookIA.ELIMINADA },
      include: simulacionInclude
    });
  },

  async listarBarberosRecomendados(idCategoriaCorte?: string | null) {
    const where: Prisma.BarberoWhereInput = {
      estadoAprobacion: EstadoAprobacion.APROBADO,
      usuario: {
        estadoCuenta: EstadoCuenta.ACTIVO,
        fechaEliminacion: null
      }
    };

    if (idCategoriaCorte) {
      where.portafoliosCortes = {
        some: {
          idCategoriaCorte,
          estadoVisibilidad: EstadoVisibilidadPortafolio.VISIBLE
        }
      };
    }

    return prisma.barbero.findMany({
      where,
      take: 10,
      orderBy: [{ calificacionPromedio: "desc" }, { totalServiciosRealizados: "desc" }],
      include: {
        portafoliosCortes: {
          where: {
            estadoVisibilidad: EstadoVisibilidadPortafolio.VISIBLE,
            ...(idCategoriaCorte ? { idCategoriaCorte } : {})
          },
          orderBy: [{ destacado: "desc" }, { fechaCreacion: "desc" }],
          take: 3,
          select: {
            idPortafolioCorte: true,
            titulo: true,
            descripcion: true,
            imagenUrl: true,
            destacado: true
          }
        },
        calificaciones: {
          where: { estadoVisibilidad: EstadoVisibilidadCalificacion.VISIBLE },
          select: { puntuacion: true }
        }
      }
    });
  }
};
