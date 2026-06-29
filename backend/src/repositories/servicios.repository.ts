import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarServicioBarberoInput,
  ActualizarServicioInput,
  AsignarServicioBarberoInput,
  CrearServicioInput,
  FiltrosServiciosInput
} from "../validators/servicios.validator";

const servicioSelect = {
  idServicio: true,
  nombre: true,
  slug: true,
  descripcion: true,
  precioBase: true,
  duracionMinutos: true,
  activo: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.ServicioSelect;

const servicioBarberoSelect = {
  idServicioBarbero: true,
  idBarbero: true,
  idServicio: true,
  precioPersonalizado: true,
  duracionPersonalizada: true,
  activo: true,
  fechaCreacion: true,
  fechaActualizacion: true,
  servicio: {
    select: servicioSelect
  }
} satisfies Prisma.ServicioBarberoSelect;

const construirWhereServicios = (
  filtros: FiltrosServiciosInput,
  soloActivos = true
) => {
  const where: Prisma.ServicioWhereInput = {};

  if (soloActivos) {
    where.activo = true;
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
      { descripcion: { contains: filtros.busqueda, mode: "insensitive" } }
    ];
  }

  return where;
};

export type ServicioCatalogo = Prisma.ServicioGetPayload<{
  select: typeof servicioSelect;
}>;
export type ServicioBarberoDetalle = Prisma.ServicioBarberoGetPayload<{
  select: typeof servicioBarberoSelect;
}>;

export const serviciosRepository = {
  async listar(filtros: FiltrosServiciosInput) {
    const where = construirWhereServicios(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [servicios, totalRegistros] = await prisma.$transaction([
      prisma.servicio.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: servicioSelect
      }),
      prisma.servicio.count({ where })
    ]);

    return { servicios, totalRegistros };
  },

  buscarActivoPorId(idServicio: string) {
    return prisma.servicio.findFirst({
      where: { idServicio, activo: true },
      select: servicioSelect
    });
  },

  buscarPorId(idServicio: string) {
    return prisma.servicio.findUnique({
      where: { idServicio },
      select: servicioSelect
    });
  },

  buscarPorSlug(slug: string) {
    return prisma.servicio.findUnique({
      where: { slug },
      select: servicioSelect
    });
  },

  buscarOtroPorSlug(slug: string, idServicio: string) {
    return prisma.servicio.findFirst({
      where: {
        slug,
        idServicio: { not: idServicio }
      },
      select: servicioSelect
    });
  },

  crear(data: CrearServicioInput & { slug: string }) {
    return prisma.servicio.create({
      data,
      select: servicioSelect
    });
  },

  actualizar(
    idServicio: string,
    data: ActualizarServicioInput & { slug?: string }
  ) {
    return prisma.servicio.update({
      where: { idServicio },
      data,
      select: servicioSelect
    });
  },

  desactivar(idServicio: string) {
    return prisma.servicio.update({
      where: { idServicio },
      data: { activo: false },
      select: servicioSelect
    });
  },

  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  listarServiciosPublicosBarbero(idBarbero: string) {
    return prisma.servicioBarbero.findMany({
      where: {
        idBarbero,
        activo: true,
        servicio: { activo: true }
      },
      orderBy: { fechaCreacion: "desc" },
      select: servicioBarberoSelect
    });
  },

  listarServiciosBarbero(idBarbero: string) {
    return prisma.servicioBarbero.findMany({
      where: { idBarbero },
      orderBy: { fechaCreacion: "desc" },
      select: servicioBarberoSelect
    });
  },

  buscarAsignacion(idServicioBarbero: string) {
    return prisma.servicioBarbero.findUnique({
      where: { idServicioBarbero },
      select: servicioBarberoSelect
    });
  },

  buscarAsignacionPorBarberoServicio(idBarbero: string, idServicio: string) {
    return prisma.servicioBarbero.findUnique({
      where: {
        idBarbero_idServicio: {
          idBarbero,
          idServicio
        }
      },
      select: servicioBarberoSelect
    });
  },

  asignar(
    idBarbero: string,
    data: AsignarServicioBarberoInput
  ) {
    return prisma.servicioBarbero.create({
      data: {
        idBarbero,
        idServicio: data.idServicio,
        precioPersonalizado: data.precioPersonalizado,
        duracionPersonalizada: data.duracionPersonalizada
      },
      select: servicioBarberoSelect
    });
  },

  actualizarAsignacion(
    idServicioBarbero: string,
    data: ActualizarServicioBarberoInput
  ) {
    return prisma.servicioBarbero.update({
      where: { idServicioBarbero },
      data,
      select: servicioBarberoSelect
    });
  },

  reactivarAsignacion(
    idServicioBarbero: string,
    data: AsignarServicioBarberoInput
  ) {
    return prisma.servicioBarbero.update({
      where: { idServicioBarbero },
      data: {
        activo: true,
        precioPersonalizado: data.precioPersonalizado,
        duracionPersonalizada: data.duracionPersonalizada
      },
      select: servicioBarberoSelect
    });
  },

  retirarAsignacion(idServicioBarbero: string) {
    return prisma.servicioBarbero.update({
      where: { idServicioBarbero },
      data: { activo: false },
      select: servicioBarberoSelect
    });
  }
};
