import Link from "next/link";
import { BadgeCheck, CreditCard, House, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { BarberosDestacados } from "@/components/landing/BarberosDestacados";
import { GaleriaPortafolio } from "@/components/landing/GaleriaPortafolio";
import { TestimoniosReales } from "@/components/landing/TestimoniosReales";

const beneficios = [
  {
    icono: BadgeCheck,
    titulo: "Barberos verificados",
    descripcion: "Perfiles revisados, portafolios reales y experiencia visible antes de reservar."
  },
  {
    icono: House,
    titulo: "Servicio a domicilio",
    descripcion: "Agenda tu corte y recibe atención profesional sin moverte de casa."
  },
  {
    icono: Sparkles,
    titulo: "LookIA para simular estilos",
    descripcion: "Prueba estilos antes de elegir tu próximo corte o barba."
  },
  {
    icono: CreditCard,
    titulo: "Pagos simples",
    descripcion: "Flujo claro para comprobantes, confirmaciones y seguimiento."
  }
];

const servicios = [
  ["Corte clásico", "Limpio, sobrio y preciso para un estilo profesional.", "Desde S/ 25"],
  ["Taper fade", "Degradado moderno con acabado natural y perfil prolijo.", "Desde S/ 35"],
  ["Barba perfilada", "Contornos definidos, simetría y acabado premium.", "Desde S/ 30"],
  ["Cabello + barba", "Servicio completo para renovar tu imagen en una sesión.", "Desde S/ 45"],
  ["Diseño de corte", "Líneas y detalles urbanos con técnica personalizada.", "Desde S/ 40"],
  ["LookIA personalizado", "Simula estilos y encuentra barberos relacionados.", "Desde S/ 20"]
];

const heroCards = [
  {
    titulo: "LookIA",
    descripcion: "Prueba estilos de corte con una simulación antes de reservar."
  },
  {
    titulo: "Reservas",
    descripcion: "Agenda tu corte a domicilio de forma rápida, segura y organizada."
  },
  {
    titulo: "Barberos verificados",
    descripcion: "Elige profesionales aprobados con portafolio, experiencia y reseñas reales."
  }
];

const menu = [
  ["Inicio", "#inicio"],
  ["Servicios", "#servicios"],
  ["Barberos", "#barberos"],
  ["Galería", "#galeria"],
  ["Beneficios", "#beneficios"],
  ["Contacto", "#contacto"]
];

function GoldButton({
  children,
  href,
  variant = "primary"
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline";
}) {
  const classes =
    variant === "primary"
      ? "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#f5d77b]"
      : "border border-[#d4af37]/60 text-[#f5d77b] hover:border-[#f5d77b] hover:bg-[#d4af37]/10";

  return (
    <Link
      className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-black transition ${classes}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function SectionTitle({
  etiqueta,
  titulo,
  descripcion
}: {
  etiqueta: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#d4af37]">{etiqueta}</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{titulo}</h2>
      <p className="mt-4 text-[#b5b5b5]">{descripcion}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a className="text-xl font-black tracking-tight" href="#inicio">
            Tijera <span className="text-[#d4af37]">Brava</span>
          </a>
          <div className="hidden items-center gap-6 lg:flex">
            {menu.map(([label, href]) => (
              <a
                className="text-sm font-semibold text-[#b5b5b5] transition hover:text-[#f5d77b]"
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </div>
          <Link
            className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b]"
            href="/login"
          >
            Reservar ahora
          </Link>
        </div>
      </nav>

      <section
        className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:py-24"
        id="inicio"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(245,215,123,0.09),transparent_28%),linear-gradient(135deg,#050505,#0d0d0d_48%,#171717)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-[#f5d77b]">
              Barbería premium a domicilio
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">
              Cortes clásicos. <span className="text-[#d4af37]">Estilo moderno.</span>{" "}
              Servicio a domicilio.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b5b5b5]">
              Reserva con barberos verificados, revisa portafolios reales y prueba estilos
              con LookIA antes de elegir tu próximo corte.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <GoldButton href="/login">Reservar ahora</GoldButton>
              <GoldButton href="/registro/barbero" variant="outline">
                Postular como barbero
              </GoldButton>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d4af37]/25 bg-[#0d0d0d]/90 p-5 shadow-2xl shadow-black/50">
            <div className="relative min-h-[460px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_25%,rgba(212,175,55,0.22),transparent_30%),linear-gradient(160deg,#171717,#050505)] p-6">
              <div className="absolute left-1/2 top-20 h-64 w-40 -translate-x-1/2 rounded-t-full border border-[#d4af37]/30 bg-gradient-to-b from-[#d4af37]/20 to-transparent" />
              <div className="absolute bottom-10 left-1/2 h-36 w-72 -translate-x-1/2 rounded-t-[5rem] border border-[#d4af37]/20 bg-black/40" />
              <div className="relative z-10 flex h-full min-h-[410px] flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f5d77b]">
                    Premium system
                  </p>
                  <span className="rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#f5d77b]">
                    Online
                  </span>
                </div>
                <div className="grid gap-3">
                  {heroCards.map((item) => (
                    <div
                      className="rounded-lg border border-white/10 bg-black/55 p-4 backdrop-blur"
                      key={item.titulo}
                    >
                      <p className="text-xl font-black">{item.titulo}</p>
                      <p className="mt-1 text-sm text-[#b5b5b5]">
                        {item.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-[#d4af37]/25 bg-[#d4af37]/10 p-4">
                  <p className="text-3xl font-black text-[#f5d77b]">4.8/5</p>
                  <p className="mt-1 text-sm text-[#b5b5b5]">
                    Referencia visual de satisfacción premium.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16" id="beneficios">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {beneficios.map(({ descripcion, icono: Icono, titulo }) => (
            <article
              className="rounded-lg border border-[#d4af37]/20 bg-[#0d0d0d] p-5 transition hover:border-[#d4af37]/60"
              key={titulo}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#D4AF37]">
                <Icono aria-hidden="true" size={23} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-lg font-black">{titulo}</h3>
              <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">{descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d] px-5 py-20" id="servicios">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            descripcion="Opciones esenciales para un estilo masculino limpio, moderno y listo para el día."
            etiqueta="Servicios destacados"
            titulo="Nuestros servicios"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {servicios.map(([nombre, descripcion, precio], index) => (
              <article
                className="rounded-lg border border-white/10 bg-[#171717] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/50"
                key={nombre}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d4af37] text-lg font-black text-black">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-6 text-xl font-black">{nombre}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#b5b5b5]">{descripcion}</p>
                <p className="mt-5 text-lg font-black text-[#f5d77b]">{precio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20" id="barberos">
        <SectionTitle
          descripcion="Conoce profesionales aprobados, su experiencia y las especialidades que dominan."
          etiqueta="Profesionales"
          titulo="Barberos destacados"
        />
        <BarberosDestacados />
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d] px-5 py-20" id="galeria">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            descripcion="Trabajos reales publicados por los profesionales de Tijera Brava."
            etiqueta="Galería"
            titulo="Nuestro trabajo habla por sí solo"
          />
          <GaleriaPortafolio />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[2rem] border border-[#d4af37]/20 bg-[#0d0d0d] p-6">
          <div className="min-h-80 rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22),transparent_35%),linear-gradient(160deg,#171717,#050505)] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f5d77b]">
              LookIA preview
            </p>
            <div className="mt-16 rounded-lg border border-[#d4af37]/25 bg-black/50 p-5">
              <p className="text-3xl font-black">Antes de reservar</p>
              <p className="mt-3 text-[#b5b5b5]">Simula, compara y elige mejor.</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#d4af37]">LookIA</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Prueba tu estilo antes de reservar
          </h2>
          <p className="mt-5 max-w-2xl leading-8 text-[#b5b5b5]">
            El cliente puede simular un estilo de corte, elegir una referencia antes de
            reservar y luego encontrar barberos relacionados con ese estilo o categoría.
          </p>
          <div className="mt-8">
            <GoldButton href="/login">Explorar LookIA</GoldButton>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            descripcion="Opiniones publicadas por clientes después de completar sus servicios."
            etiqueta="Testimonios"
            titulo="Confianza desde el primer corte"
          />
          <TestimoniosReales />
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#d4af37]/30 bg-[linear-gradient(135deg,#171717,#0d0d0d)] p-8 text-center sm:p-12">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            ¿Listo para un corte con estilo?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[#b5b5b5]">
            Agenda tu próxima reserva y recibe atención profesional sin salir de casa.
          </p>
          <div className="mt-8">
            <GoldButton href="/login">Reservar ahora</GoldButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050505] px-5 py-12" id="contacto">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <p className="text-xl font-black">
              Tijera <span className="text-[#d4af37]">Brava</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-[#b5b5b5]">
              Plataforma de reservas de barbería masculina a domicilio con estilo premium.
            </p>
          </div>
          <div>
            <p className="font-bold text-white">Enlaces rápidos</p>
            <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5]">
              <a href="#servicios">Servicios</a>
              <a href="#barberos">Barberos</a>
              <a href="#galeria">Galería</a>
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Servicios</p>
            <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5]">
              <span>Corte clásico</span>
              <span>Taper fade</span>
              <span>Barba perfilada</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Contacto</p>
            <div className="mt-4 grid gap-2 text-sm text-[#b5b5b5]">
              <span>Lima, Perú</span>
              <span>contacto@tijerabrava.com</span>
              <span>Atención a domicilio</span>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-[#b5b5b5]">
          © 2026 Tijera Brava. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
