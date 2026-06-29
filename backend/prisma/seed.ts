import bcrypt from "bcrypt";
import {
  DiaSemana,
  EstadoAprobacion,
  EstadoCuenta,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const contrasenaPrueba = "TijeraBrava2026!";
const saltRounds = 10;

const generarSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function main() {
  const contrasenaHash = await bcrypt.hash(contrasenaPrueba, saltRounds);

  const [rolAdministrador, rolCliente, rolBarbero] = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: "ADMINISTRADOR" },
      update: {
        descripcion: "Usuario con acceso administrativo",
        estado: true
      },
      create: {
        nombre: "ADMINISTRADOR",
        descripcion: "Usuario con acceso administrativo",
        estado: true
      }
    }),
    prisma.rol.upsert({
      where: { nombre: "CLIENTE" },
      update: {
        descripcion: "Cliente de la plataforma",
        estado: true
      },
      create: {
        nombre: "CLIENTE",
        descripcion: "Cliente de la plataforma",
        estado: true
      }
    }),
    prisma.rol.upsert({
      where: { nombre: "BARBERO" },
      update: {
        descripcion: "Barbero registrado en la plataforma",
        estado: true
      },
      create: {
        nombre: "BARBERO",
        descripcion: "Barbero registrado en la plataforma",
        estado: true
      }
    })
  ]);

  const administrador = await prisma.usuario.upsert({
    where: { correo: "administrador@tijerabrava.com" },
    update: {
      idRol: rolAdministrador.idRol,
      nombres: "Admin",
      apellidos: "Tijera Brava",
      telefono: "900000001",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    },
    create: {
      idRol: rolAdministrador.idRol,
      nombres: "Admin",
      apellidos: "Tijera Brava",
      correo: "administrador@tijerabrava.com",
      telefono: "900000001",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    }
  });

  const usuarioCliente = await prisma.usuario.upsert({
    where: { correo: "cliente@tijerabrava.com" },
    update: {
      idRol: rolCliente.idRol,
      nombres: "Cliente",
      apellidos: "Demo",
      telefono: "900000002",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    },
    create: {
      idRol: rolCliente.idRol,
      nombres: "Cliente",
      apellidos: "Demo",
      correo: "cliente@tijerabrava.com",
      telefono: "900000002",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    }
  });

  await prisma.cliente.upsert({
    where: { idUsuario: usuarioCliente.idUsuario },
    update: {
      fechaNacimiento: new Date("1995-06-15"),
      estiloPreferido: "Degradado clásico"
    },
    create: {
      idUsuario: usuarioCliente.idUsuario,
      fechaNacimiento: new Date("1995-06-15"),
      estiloPreferido: "Degradado clásico"
    }
  });

  const usuarioBarbero = await prisma.usuario.upsert({
    where: { correo: "barbero@tijerabrava.com" },
    update: {
      idRol: rolBarbero.idRol,
      nombres: "Carlos",
      apellidos: "Navaja",
      telefono: "900000003",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    },
    create: {
      idRol: rolBarbero.idRol,
      nombres: "Carlos",
      apellidos: "Navaja",
      correo: "barbero@tijerabrava.com",
      telefono: "900000003",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.ACTIVO,
      correoVerificado: true
    }
  });

  const barberoAprobado = await prisma.barbero.upsert({
    where: { idUsuario: usuarioBarbero.idUsuario },
    update: {
      nombreProfesional: "Carlos Barber",
      biografia: "Especialista en cortes clásicos y modernos a domicilio.",
      anosExperiencia: 5,
      estadoAprobacion: EstadoAprobacion.APROBADO,
      calificacionPromedio: 4.8,
      totalServiciosRealizados: 25,
      disponible: true,
      fechaAprobacion: new Date(),
      aprobadoPor: administrador.idUsuario
    },
    create: {
      idUsuario: usuarioBarbero.idUsuario,
      nombreProfesional: "Carlos Barber",
      biografia: "Especialista en cortes clásicos y modernos a domicilio.",
      anosExperiencia: 5,
      estadoAprobacion: EstadoAprobacion.APROBADO,
      calificacionPromedio: 4.8,
      totalServiciosRealizados: 25,
      disponible: true,
      fechaAprobacion: new Date(),
      aprobadoPor: administrador.idUsuario
    }
  });

  const usuarioBarberoPendiente = await prisma.usuario.upsert({
    where: { correo: "barbero.pendiente@tijerabrava.com" },
    update: {
      idRol: rolBarbero.idRol,
      nombres: "Luis",
      apellidos: "Pendiente",
      telefono: "900000004",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.PENDIENTE,
      correoVerificado: false
    },
    create: {
      idRol: rolBarbero.idRol,
      nombres: "Luis",
      apellidos: "Pendiente",
      correo: "barbero.pendiente@tijerabrava.com",
      telefono: "900000004",
      contrasenaHash,
      estadoCuenta: EstadoCuenta.PENDIENTE,
      correoVerificado: false
    }
  });

  await prisma.barbero.upsert({
    where: { idUsuario: usuarioBarberoPendiente.idUsuario },
    update: {
      nombreProfesional: "Luis Barber",
      biografia: "Barbero en proceso de aprobación.",
      anosExperiencia: 2,
      estadoAprobacion: EstadoAprobacion.PENDIENTE,
      calificacionPromedio: 0,
      totalServiciosRealizados: 0,
      disponible: false,
      fechaAprobacion: null,
      aprobadoPor: null
    },
    create: {
      idUsuario: usuarioBarberoPendiente.idUsuario,
      nombreProfesional: "Luis Barber",
      biografia: "Barbero en proceso de aprobación.",
      anosExperiencia: 2,
      estadoAprobacion: EstadoAprobacion.PENDIENTE,
      calificacionPromedio: 0,
      totalServiciosRealizados: 0,
      disponible: false
    }
  });

  const servicios = [
    {
      nombre: "Corte clásico",
      descripcion: "Corte masculino tradicional con acabado limpio",
      precioBase: 30,
      duracionMinutos: 45
    },
    {
      nombre: "Taper fade",
      descripcion: "Corte con degradado progresivo",
      precioBase: 35,
      duracionMinutos: 60
    },
    {
      nombre: "Corte y barba",
      descripcion: "Servicio completo de corte y perfilado de barba",
      precioBase: 50,
      duracionMinutos: 75
    },
    {
      nombre: "Barba premium",
      descripcion: "Perfilado, arreglo y acabado premium de barba",
      precioBase: 25,
      duracionMinutos: 35
    }
  ];

  await Promise.all(
    servicios.map((servicio) =>
      prisma.servicio.upsert({
        where: { slug: generarSlug(servicio.nombre) },
        update: {
          descripcion: servicio.descripcion,
          precioBase: servicio.precioBase,
          duracionMinutos: servicio.duracionMinutos,
          activo: true
        },
        create: {
          ...servicio,
          slug: generarSlug(servicio.nombre),
          activo: true
        }
      })
    )
  );

  const especialidades = [
    {
      nombre: "Degradados",
      descripcion: "Especialista en fades y degradados"
    },
    {
      nombre: "Cortes clásicos",
      descripcion: "Técnicas tradicionales de barbería masculina"
    },
    {
      nombre: "Diseño de barba",
      descripcion: "Perfilado y diseño personalizado de barba"
    },
    {
      nombre: "Cortes modernos",
      descripcion: "Tendencias actuales en cortes masculinos"
    }
  ];

  await Promise.all(
    especialidades.map((especialidad) =>
      prisma.especialidad.upsert({
        where: { slug: generarSlug(especialidad.nombre) },
        update: {
          descripcion: especialidad.descripcion,
          activa: true
        },
        create: {
          ...especialidad,
          slug: generarSlug(especialidad.nombre),
          activa: true
        }
      })
    )
  );

  const zonas = [
    "San Miguel",
    "Pueblo Libre",
    "Magdalena del Mar",
    "Jesús María",
    "Cercado de Lima"
  ];

  await Promise.all(
    zonas.map((nombre) =>
      prisma.zonaCobertura.upsert({
        where: { slug: generarSlug(nombre) },
        update: {
          distrito: nombre,
          provincia: "Lima",
          departamento: "Lima",
          activa: true
        },
        create: {
          nombre,
          slug: generarSlug(nombre),
          distrito: nombre,
          provincia: "Lima",
          departamento: "Lima",
          activa: true
        }
      })
    )
  );

  const horariosIniciales = [
    { diaSemana: DiaSemana.LUNES, horaInicio: "09:00", horaFin: "13:00" },
    { diaSemana: DiaSemana.LUNES, horaInicio: "15:00", horaFin: "19:00" },
    { diaSemana: DiaSemana.MARTES, horaInicio: "09:00", horaFin: "18:00" },
    { diaSemana: DiaSemana.MIERCOLES, horaInicio: "09:00", horaFin: "18:00" },
    { diaSemana: DiaSemana.JUEVES, horaInicio: "09:00", horaFin: "18:00" },
    { diaSemana: DiaSemana.VIERNES, horaInicio: "09:00", horaFin: "18:00" },
    { diaSemana: DiaSemana.SABADO, horaInicio: "09:00", horaFin: "14:00" }
  ];

  for (const horario of horariosIniciales) {
    const existente = await prisma.horarioDisponibilidad.findFirst({
      where: {
        idBarbero: barberoAprobado.idBarbero,
        diaSemana: horario.diaSemana,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      }
    });

    if (existente) {
      await prisma.horarioDisponibilidad.update({
        where: {
          idHorarioDisponibilidad: existente.idHorarioDisponibilidad
        },
        data: { activo: true }
      });
      continue;
    }

    await prisma.horarioDisponibilidad.create({
      data: {
        idBarbero: barberoAprobado.idBarbero,
        ...horario,
        activo: true
      }
    });
  }

  const reservasSinPago = await prisma.reserva.findMany({
    where: { pago: null }
  });

  for (const reserva of reservasSinPago) {
    await prisma.pago.create({
      data: {
        idReserva: reserva.idReserva,
        metodoPago: reserva.metodoPago,
        estadoPago: "PENDIENTE",
        montoServicio: reserva.precioServicio,
        montoTraslado: reserva.costoTraslado,
        montoTotal: reserva.total,
        historialPagos: {
          create: {
            estadoAnterior: null,
            estadoNuevo: "PENDIENTE",
            comentario: "Pago inicial creado por seed"
          }
        }
      }
    });
  }

  const categoriasCortes = [
    {
      nombre: "Taper fade",
      descripcion: "Cortes con degradado progresivo en laterales"
    },
    { nombre: "Low fade", descripcion: "Degradado bajo y limpio" },
    { nombre: "Mid fade", descripcion: "Degradado medio equilibrado" },
    { nombre: "High fade", descripcion: "Degradado alto con contraste" },
    { nombre: "Corte clásico", descripcion: "Cortes tradicionales masculinos" },
    { nombre: "Corte moderno", descripcion: "Estilos modernos y texturizados" },
    { nombre: "Barba", descripcion: "Diseño, perfilado y cuidado de barba" },
    { nombre: "Diseño de líneas", descripcion: "Diseños y líneas personalizadas" }
  ];

  const categoriasCreadas = await Promise.all(
    categoriasCortes.map((categoria) =>
      prisma.categoriaCorte.upsert({
        where: { slug: generarSlug(categoria.nombre) },
        update: {
          descripcion: categoria.descripcion,
          activa: true
        },
        create: {
          ...categoria,
          slug: generarSlug(categoria.nombre),
          activa: true
        }
      })
    )
  );

  const categoriaPorSlug = new Map(
    categoriasCreadas.map((categoria) => [categoria.slug, categoria])
  );

  const estilosLookIAIniciales = [
    {
      nombre: "Taper fade moderno",
      descripcion: "Simulación de taper fade moderno con acabado limpio",
      promptBase: "Generar un taper fade moderno masculino con textura natural",
      imagenReferenciaUrl: "https://example.com/lookia/estilos/taper-fade-moderno.jpg",
      slugCategoria: "taper-fade"
    },
    {
      nombre: "Low fade natural",
      descripcion: "Simulación de low fade natural para estilo diario",
      promptBase: "Generar un low fade natural con laterales suaves",
      imagenReferenciaUrl: "https://example.com/lookia/estilos/low-fade-natural.jpg",
      slugCategoria: "low-fade"
    },
    {
      nombre: "Corte clásico ejecutivo",
      descripcion: "Simulación de corte clásico para estilo profesional",
      promptBase: "Generar un corte clásico ejecutivo masculino",
      imagenReferenciaUrl: "https://example.com/lookia/estilos/corte-clasico-ejecutivo.jpg",
      slugCategoria: "corte-clasico"
    },
    {
      nombre: "Barba perfilada",
      descripcion: "Simulación de barba perfilada con contornos limpios",
      promptBase: "Generar una barba perfilada con acabado premium",
      imagenReferenciaUrl: "https://example.com/lookia/estilos/barba-perfilada.jpg",
      slugCategoria: "barba"
    },
    {
      nombre: "Diseño de líneas urbano",
      descripcion: "Simulación de diseño urbano con líneas personalizadas",
      promptBase: "Generar un diseño urbano con líneas marcadas",
      imagenReferenciaUrl: "https://example.com/lookia/estilos/diseno-lineas-urbano.jpg",
      slugCategoria: "diseno-de-lineas"
    }
  ];

  await Promise.all(
    estilosLookIAIniciales.map((estilo) => {
      const categoria = categoriaPorSlug.get(estilo.slugCategoria);
      const slug = generarSlug(estilo.nombre);

      return prisma.estiloLookIA.upsert({
        where: { slug },
        update: {
          nombre: estilo.nombre,
          descripcion: estilo.descripcion,
          promptBase: estilo.promptBase,
          imagenReferenciaUrl: estilo.imagenReferenciaUrl,
          idCategoriaCorte: categoria?.idCategoriaCorte,
          activo: true
        },
        create: {
          nombre: estilo.nombre,
          slug,
          descripcion: estilo.descripcion,
          promptBase: estilo.promptBase,
          imagenReferenciaUrl: estilo.imagenReferenciaUrl,
          idCategoriaCorte: categoria?.idCategoriaCorte,
          activo: true
        }
      });
    })
  );

  const portafoliosIniciales = [
    {
      titulo: "Taper fade limpio",
      descripcion: "Degradado limpio con acabado natural",
      imagenUrl: "https://example.com/portafolio/taper-fade.jpg",
      slugCategoria: "taper-fade",
      destacado: true
    },
    {
      titulo: "Corte clásico ejecutivo",
      descripcion: "Corte elegante para estilo profesional",
      imagenUrl: "https://example.com/portafolio/corte-clasico-ejecutivo.jpg",
      slugCategoria: "corte-clasico",
      destacado: false
    },
    {
      titulo: "Barba perfilada",
      descripcion: "Perfilado preciso de barba con acabado premium",
      imagenUrl: "https://example.com/portafolio/barba-perfilada.jpg",
      slugCategoria: "barba",
      destacado: true
    },
    {
      titulo: "Diseño de líneas moderno",
      descripcion: "Líneas modernas con detalle personalizado",
      imagenUrl: "https://example.com/portafolio/diseno-lineas-moderno.jpg",
      slugCategoria: "diseno-de-lineas",
      destacado: false
    }
  ];

  for (const portafolio of portafoliosIniciales) {
    const existente = await prisma.portafolioCorte.findFirst({
      where: {
        idBarbero: barberoAprobado.idBarbero,
        titulo: portafolio.titulo
      }
    });

    const categoria = categoriaPorSlug.get(portafolio.slugCategoria);

    if (existente) {
      await prisma.portafolioCorte.update({
        where: { idPortafolioCorte: existente.idPortafolioCorte },
        data: {
          descripcion: portafolio.descripcion,
          imagenUrl: portafolio.imagenUrl,
          idCategoriaCorte: categoria?.idCategoriaCorte,
          destacado: portafolio.destacado,
          estadoVisibilidad: "VISIBLE",
          motivoModeracion: null
        }
      });
      continue;
    }

    await prisma.portafolioCorte.create({
      data: {
        idBarbero: barberoAprobado.idBarbero,
        idCategoriaCorte: categoria?.idCategoriaCorte,
        titulo: portafolio.titulo,
        descripcion: portafolio.descripcion,
        imagenUrl: portafolio.imagenUrl,
        destacado: portafolio.destacado,
        estadoVisibilidad: "VISIBLE"
      }
    });
  }

  const reservaFinalizadaSinCalificacion = await prisma.reserva.findFirst({
    where: {
      estadoReserva: "FINALIZADA",
      calificacion: null
    }
  });

  if (reservaFinalizadaSinCalificacion) {
    await prisma.calificacion.create({
      data: {
        idReserva: reservaFinalizadaSinCalificacion.idReserva,
        idCliente: reservaFinalizadaSinCalificacion.idCliente,
        idBarbero: reservaFinalizadaSinCalificacion.idBarbero,
        puntuacion: 5,
        comentario: "Excelente servicio, puntual y profesional.",
        estadoVisibilidad: "VISIBLE"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error ejecutando seed de Prisma:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
