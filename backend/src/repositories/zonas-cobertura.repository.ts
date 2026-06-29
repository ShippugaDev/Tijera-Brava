import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarZonaBarberoInput,
  ActualizarZonaCoberturaInput,
  AsignarZonaBarberoInput,
  CrearZonaCoberturaInput,
  FiltrosZonasCoberturaInput
} from "../validators/zonas-cobertura.validator";

const zonaSelect = {
  idZonaCobertura: true,
  nombre: true,
  slug: true,
  distrito: true,
  provincia: true,
  departamento: true,
  activa: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.ZonaCoberturaSelect;

const zonaBarberoSelect = {
  idZonaBarbero: true,
  idBarbero: true,
  idZonaCobertura: true,
  costoTraslado: true,
  tiempoTrasladoMinutos: true,
  activa: true,
  fechaCreacion: true,
  fechaActualizacion: true,
  zonaCobertura: {
    select: zonaSelect
  }
} satisfies Prisma.ZonaBarberoSelect;

const construirWhereZonas = (filtros: FiltrosZonasCoberturaInput) => {
  const where: Prisma.ZonaCoberturaWhereInput = { activa: true };

  if (filtros.distrito) {
    where.distrito = { contains: filtros.distrito, mode: "insensitive" };
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
      { distrito: { contains: filtros.busqueda, mode: "insensitive" } },
      { provincia: { contains: filtros.busqueda, mode: "insensitive" } },
      { departamento: { contains: filtros.busqueda, mode: "insensitive" } }
    ];
  }

  return where;
};

export type ZonaCatalogo = Prisma.ZonaCoberturaGetPayload<{
  select: typeof zonaSelect;
}>;
export type ZonaBarberoDetalle = Prisma.ZonaBarberoGetPayload<{
  select: typeof zonaBarberoSelect;
}>;

export const zonasCoberturaRepository = {
  async listar(filtros: FiltrosZonasCoberturaInput) {
    const where = construirWhereZonas(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [zonas, totalRegistros] = await prisma.$transaction([
      prisma.zonaCobertura.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: zonaSelect
      }),
      prisma.zonaCobertura.count({ where })
    ]);

    return { zonas, totalRegistros };
  },

  buscarActivaPorId(idZonaCobertura: string) {
    return prisma.zonaCobertura.findFirst({
      where: { idZonaCobertura, activa: true },
      select: zonaSelect
    });
  },

  buscarPorId(idZonaCobertura: string) {
    return prisma.zonaCobertura.findUnique({
      where: { idZonaCobertura },
      select: zonaSelect
    });
  },

  buscarPorSlug(slug: string) {
    return prisma.zonaCobertura.findUnique({
      where: { slug },
      select: zonaSelect
    });
  },

  buscarOtraPorSlug(slug: string, idZonaCobertura: string) {
    return prisma.zonaCobertura.findFirst({
      where: { slug, idZonaCobertura: { not: idZonaCobertura } },
      select: zonaSelect
    });
  },

  crear(data: CrearZonaCoberturaInput & { slug: string }) {
    return prisma.zonaCobertura.create({
      data: {
        ...data,
        provincia: data.provincia ?? "Lima",
        departamento: data.departamento ?? "Lima"
      },
      select: zonaSelect
    });
  },

  actualizar(
    idZonaCobertura: string,
    data: ActualizarZonaCoberturaInput & { slug?: string }
  ) {
    return prisma.zonaCobertura.update({
      where: { idZonaCobertura },
      data,
      select: zonaSelect
    });
  },

  desactivar(idZonaCobertura: string) {
    return prisma.zonaCobertura.update({
      where: { idZonaCobertura },
      data: { activa: false },
      select: zonaSelect
    });
  },

  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  listarPublicasBarbero(idBarbero: string) {
    return prisma.zonaBarbero.findMany({
      where: {
        idBarbero,
        activa: true,
        zonaCobertura: { activa: true }
      },
      orderBy: { fechaCreacion: "desc" },
      select: zonaBarberoSelect
    });
  },

  listarBarbero(idBarbero: string) {
    return prisma.zonaBarbero.findMany({
      where: { idBarbero },
      orderBy: { fechaCreacion: "desc" },
      select: zonaBarberoSelect
    });
  },

  buscarAsignacion(idZonaBarbero: string) {
    return prisma.zonaBarbero.findUnique({
      where: { idZonaBarbero },
      select: zonaBarberoSelect
    });
  },

  buscarAsignacionPorBarberoZona(idBarbero: string, idZonaCobertura: string) {
    return prisma.zonaBarbero.findUnique({
      where: {
        idBarbero_idZonaCobertura: {
          idBarbero,
          idZonaCobertura
        }
      },
      select: zonaBarberoSelect
    });
  },

  asignar(idBarbero: string, data: AsignarZonaBarberoInput) {
    return prisma.zonaBarbero.create({
      data: {
        idBarbero,
        idZonaCobertura: data.idZonaCobertura,
        costoTraslado: data.costoTraslado,
        tiempoTrasladoMinutos: data.tiempoTrasladoMinutos
      },
      select: zonaBarberoSelect
    });
  },

  actualizarAsignacion(idZonaBarbero: string, data: ActualizarZonaBarberoInput) {
    return prisma.zonaBarbero.update({
      where: { idZonaBarbero },
      data,
      select: zonaBarberoSelect
    });
  },

  retirarAsignacion(idZonaBarbero: string) {
    return prisma.zonaBarbero.update({
      where: { idZonaBarbero },
      data: { activa: false },
      select: zonaBarberoSelect
    });
  }
};
