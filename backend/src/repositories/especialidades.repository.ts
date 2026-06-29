import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type {
  ActualizarEspecialidadInput,
  AsignarEspecialidadInput,
  CrearEspecialidadInput,
  FiltrosEspecialidadesInput
} from "../validators/especialidades.validator";

const especialidadSelect = {
  idEspecialidad: true,
  nombre: true,
  slug: true,
  descripcion: true,
  activa: true,
  fechaCreacion: true,
  fechaActualizacion: true
} satisfies Prisma.EspecialidadSelect;

const especialidadBarberoSelect = {
  idEspecialidadBarbero: true,
  idBarbero: true,
  idEspecialidad: true,
  fechaCreacion: true,
  especialidad: {
    select: especialidadSelect
  }
} satisfies Prisma.EspecialidadBarberoSelect;

const construirWhereEspecialidades = (filtros: FiltrosEspecialidadesInput) => {
  const where: Prisma.EspecialidadWhereInput = { activa: true };

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
      { descripcion: { contains: filtros.busqueda, mode: "insensitive" } }
    ];
  }

  return where;
};

export type EspecialidadCatalogo = Prisma.EspecialidadGetPayload<{
  select: typeof especialidadSelect;
}>;
export type EspecialidadBarberoDetalle =
  Prisma.EspecialidadBarberoGetPayload<{
    select: typeof especialidadBarberoSelect;
  }>;

export const especialidadesRepository = {
  async listar(filtros: FiltrosEspecialidadesInput) {
    const where = construirWhereEspecialidades(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [especialidades, totalRegistros] = await prisma.$transaction([
      prisma.especialidad.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fechaCreacion: "desc" },
        select: especialidadSelect
      }),
      prisma.especialidad.count({ where })
    ]);

    return { especialidades, totalRegistros };
  },

  buscarActivaPorId(idEspecialidad: string) {
    return prisma.especialidad.findFirst({
      where: { idEspecialidad, activa: true },
      select: especialidadSelect
    });
  },

  buscarPorId(idEspecialidad: string) {
    return prisma.especialidad.findUnique({
      where: { idEspecialidad },
      select: especialidadSelect
    });
  },

  buscarPorSlug(slug: string) {
    return prisma.especialidad.findUnique({
      where: { slug },
      select: especialidadSelect
    });
  },

  buscarOtraPorSlug(slug: string, idEspecialidad: string) {
    return prisma.especialidad.findFirst({
      where: { slug, idEspecialidad: { not: idEspecialidad } },
      select: especialidadSelect
    });
  },

  crear(data: CrearEspecialidadInput & { slug: string }) {
    return prisma.especialidad.create({ data, select: especialidadSelect });
  },

  actualizar(
    idEspecialidad: string,
    data: ActualizarEspecialidadInput & { slug?: string }
  ) {
    return prisma.especialidad.update({
      where: { idEspecialidad },
      data,
      select: especialidadSelect
    });
  },

  desactivar(idEspecialidad: string) {
    return prisma.especialidad.update({
      where: { idEspecialidad },
      data: { activa: false },
      select: especialidadSelect
    });
  },

  buscarBarberoPorUsuario(idUsuario: string) {
    return prisma.barbero.findUnique({
      where: { idUsuario },
      include: { usuario: true }
    });
  },

  listarPublicasBarbero(idBarbero: string) {
    return prisma.especialidadBarbero.findMany({
      where: { idBarbero, especialidad: { activa: true } },
      orderBy: { fechaCreacion: "desc" },
      select: especialidadBarberoSelect
    });
  },

  listarBarbero(idBarbero: string) {
    return prisma.especialidadBarbero.findMany({
      where: { idBarbero },
      orderBy: { fechaCreacion: "desc" },
      select: especialidadBarberoSelect
    });
  },

  buscarAsignacion(idEspecialidadBarbero: string) {
    return prisma.especialidadBarbero.findUnique({
      where: { idEspecialidadBarbero },
      select: especialidadBarberoSelect
    });
  },

  buscarAsignacionPorBarberoEspecialidad(
    idBarbero: string,
    idEspecialidad: string
  ) {
    return prisma.especialidadBarbero.findUnique({
      where: {
        idBarbero_idEspecialidad: {
          idBarbero,
          idEspecialidad
        }
      },
      select: especialidadBarberoSelect
    });
  },

  asignar(idBarbero: string, data: AsignarEspecialidadInput) {
    return prisma.especialidadBarbero.create({
      data: {
        idBarbero,
        idEspecialidad: data.idEspecialidad
      },
      select: especialidadBarberoSelect
    });
  },

  retirar(idEspecialidadBarbero: string) {
    return prisma.especialidadBarbero.delete({
      where: { idEspecialidadBarbero },
      select: especialidadBarberoSelect
    });
  }
};
