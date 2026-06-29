import type { Prisma } from "@prisma/client";
import { EstadoAprobacion, EstadoCuenta } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarPerfilBarberoInput,
  FiltrosBarberosPendientesInput,
  FiltrosBarberosPublicosInput
} from "../validators/barberos.validator";

const barberoPerfilSelect = {
  idBarbero: true,
  idUsuario: true,
  nombreProfesional: true,
  biografia: true,
  anosExperiencia: true,
  estadoAprobacion: true,
  calificacionPromedio: true,
  totalServiciosRealizados: true,
  disponible: true,
  fechaAprobacion: true,
  fechaCreacion: true,
  fechaActualizacion: true,
  usuario: {
    select: {
      idUsuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
      telefono: true,
      fotoPerfilUrl: true,
      estadoCuenta: true,
      rol: {
        select: {
          nombre: true
        }
      }
    }
  }
} satisfies Prisma.BarberoSelect;

const construirWherePendientes = (filtros: FiltrosBarberosPendientesInput) => {
  const where: Prisma.BarberoWhereInput = {
    estadoAprobacion: EstadoAprobacion.PENDIENTE
  };

  if (filtros.busqueda) {
    where.OR = [
      { nombreProfesional: { contains: filtros.busqueda, mode: "insensitive" } },
      { usuario: { nombres: { contains: filtros.busqueda, mode: "insensitive" } } },
      { usuario: { apellidos: { contains: filtros.busqueda, mode: "insensitive" } } },
      { usuario: { correo: { contains: filtros.busqueda, mode: "insensitive" } } }
    ];
  }

  return where;
};

const construirWherePublicos = (filtros: FiltrosBarberosPublicosInput) => {
  const where: Prisma.BarberoWhereInput = {
    estadoAprobacion: EstadoAprobacion.APROBADO,
    usuario: {
      estadoCuenta: EstadoCuenta.ACTIVO,
      fechaEliminacion: null
    }
  };

  if (filtros.disponible !== undefined) where.disponible = filtros.disponible;
  if (filtros.calificacion_minima !== undefined) {
    where.calificacionPromedio = { gte: filtros.calificacion_minima };
  }
  if (filtros.busqueda) {
    where.OR = [
      { nombreProfesional: { contains: filtros.busqueda, mode: "insensitive" } },
      { biografia: { contains: filtros.busqueda, mode: "insensitive" } },
      { usuario: { nombres: { contains: filtros.busqueda, mode: "insensitive" } } },
      { usuario: { apellidos: { contains: filtros.busqueda, mode: "insensitive" } } }
    ];
  }
  if (filtros.distrito) {
    where.zonasBarberos = {
      some: {
        activa: true,
        zonaCobertura: {
          activa: true,
          distrito: { contains: filtros.distrito, mode: "insensitive" }
        }
      }
    };
  }
  if (filtros.servicio) {
    where.serviciosBarberos = {
      some: {
        activo: true,
        servicio: {
          activo: true,
          slug: { contains: filtros.servicio, mode: "insensitive" }
        }
      }
    };
  }
  if (filtros.especialidad) {
    where.especialidadesBarberos = {
      some: {
        especialidad: {
          activa: true,
          slug: { contains: filtros.especialidad, mode: "insensitive" }
        }
      }
    };
  }

  return where;
};

export type BarberoPerfil = Prisma.BarberoGetPayload<{
  select: typeof barberoPerfilSelect;
}>;

export const barberosRepository = {
  buscarPerfilPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      select: barberoPerfilSelect
    });
  },

  actualizarPerfil(idUsuario: string, data: ActualizarPerfilBarberoInput) {
    return prisma.barbero.update({
      where: { idUsuario },
      data,
      select: barberoPerfilSelect
    });
  },

  async listarPendientes(filtros: FiltrosBarberosPendientesInput) {
    const where = construirWherePendientes(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [barberos, totalRegistros] = await prisma.$transaction([
      prisma.barbero.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: barberoPerfilSelect
      }),
      prisma.barbero.count({ where })
    ]);

    return { barberos, totalRegistros };
  },

  async listarPublicos(filtros: FiltrosBarberosPublicosInput) {
    const where = construirWherePublicos(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [barberos, totalRegistros] = await prisma.$transaction([
      prisma.barbero.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: [{ disponible: "desc" }, { calificacionPromedio: "desc" }],
        select: {
          idBarbero: true,
          idUsuario: true,
          nombreProfesional: true,
          biografia: true,
          anosExperiencia: true,
          estadoAprobacion: true,
          calificacionPromedio: true,
          totalServiciosRealizados: true,
          disponible: true,
          usuario: {
            select: {
              nombres: true,
              apellidos: true,
              fotoPerfilUrl: true
            }
          },
          especialidadesBarberos: {
            where: { especialidad: { activa: true } },
            select: {
              especialidad: {
                select: {
                  nombre: true,
                  slug: true
                }
              }
            }
          }
        }
      }),
      prisma.barbero.count({ where })
    ]);

    return { barberos, totalRegistros };
  },

  buscarPublicoPorId(idBarbero: string) {
    return prisma.barbero.findFirst({
      where: {
        idBarbero,
        estadoAprobacion: EstadoAprobacion.APROBADO,
        usuario: {
          estadoCuenta: EstadoCuenta.ACTIVO,
          fechaEliminacion: null
        }
      },
      select: barberoPerfilSelect
    });
  },

  buscarPorId(idBarbero: string) {
    return prisma.barbero.findUnique({
      where: { idBarbero },
      select: barberoPerfilSelect
    });
  },

  aprobar(idBarbero: string, idAdministrador: string) {
    return prisma.barbero.update({
      where: { idBarbero },
      data: {
        estadoAprobacion: EstadoAprobacion.APROBADO,
        fechaAprobacion: new Date(),
        aprobadoPor: idAdministrador,
        disponible: true
      },
      select: barberoPerfilSelect
    });
  },

  rechazar(idBarbero: string) {
    return prisma.barbero.update({
      where: { idBarbero },
      data: {
        estadoAprobacion: EstadoAprobacion.RECHAZADO,
        fechaAprobacion: null,
        aprobadoPor: null,
        disponible: false
      },
      select: barberoPerfilSelect
    });
  },

  suspender(idBarbero: string) {
    return prisma.barbero.update({
      where: { idBarbero },
      data: {
        usuario: {
          update: {
            estadoCuenta: "SUSPENDIDO"
          }
        },
        disponible: false
      },
      select: barberoPerfilSelect
    });
  }
};
