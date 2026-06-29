import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  etiqueta: string;
  titulo: string;
  subtitulo: string;
  children: ReactNode;
};

const beneficiosAuth = [
  {
    titulo: "LookIA",
    descripcion: "Simula diferentes estilos de corte antes de reservar."
  },
  {
    titulo: "Reservas",
    descripcion: "Agenda tu servicio a domicilio de forma rápida y segura."
  },
  {
    titulo: "Barberos verificados",
    descripcion: "Elige profesionales aprobados con portafolio y reseñas reales."
  }
];

export function AuthLayout({ etiqueta, titulo, subtitulo, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_18%_10%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(245,215,123,0.08),transparent_26%),linear-gradient(135deg,#050505,#0d0d0d_55%,#050505)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#d4af37]/20 bg-[#0d0d0d]/90 shadow-2xl shadow-black/50 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-white/10 bg-[linear-gradient(160deg,#171717,#050505)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link className="text-2xl font-black tracking-tight" href="/">
              Tijera <span className="text-[#d4af37]">Brava</span>
            </Link>
            <div className="mt-12">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f5d77b]">
                Barbería premium
              </p>
              <h2 className="mt-5 text-5xl font-black tracking-tight">
                Reserva cortes a domicilio con estilo.
              </h2>
              <p className="mt-6 max-w-md leading-8 text-[#b5b5b5]">
                Conecta con barberos verificados, revisa portafolios reales y prueba
                estilos con LookIA antes de reservar.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {beneficiosAuth.map((item) => (
              <div className="rounded-lg border border-[#d4af37]/20 bg-black/40 p-4" key={item.titulo}>
                <p className="font-black text-[#f5d77b]">{item.titulo}</p>
                <p className="mt-1 text-sm text-[#b5b5b5]">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-xl">
            <Link className="mb-8 inline-flex text-xl font-black lg:hidden" href="/">
              Tijera <span className="ml-1 text-[#d4af37]">Brava</span>
            </Link>
            <div className="rounded-[1.5rem] border border-[#d4af37]/20 bg-[#050505]/80 p-6 shadow-xl shadow-black/30 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#d4af37]">
                {etiqueta}
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h1>
              <p className="mt-3 leading-7 text-[#b5b5b5]">{subtitulo}</p>
              <div className="mt-7">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
