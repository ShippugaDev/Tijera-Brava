import Link from "next/link";
import type { BarberoRecomendado } from "@/lib/types";

export function BarberoRecomendadoCard({ barbero }: { barbero: BarberoRecomendado }) {
  const experiencia = barbero.anosExperiencia ?? barbero.aniosExperiencia ?? 0;
  const calificacion = barbero.promedioCalificacion ?? barbero.calificacionPromedio ?? 0;

  return (
    <article className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{barbero.nombreProfesional}</h3>
          <p className="mt-2 text-sm leading-6 text-[#b5b5b5]">
            {barbero.biografia ?? "Recomendado por afinidad con el estilo seleccionado."}
          </p>
        </div>
        <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#f5d77b]">
          LookIA
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Especialidad</p>
          <p className="mt-1 font-black text-white">{barbero.especialidad ?? "Cortes premium"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Calificación</p>
          <p className="mt-1 font-black text-[#f5d77b]">{Number(calificacion).toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Experiencia</p>
          <p className="mt-1 font-black text-white">{experiencia} años</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-3">
          <p className="text-[#b5b5b5]">Portafolio</p>
          <p className="mt-1 font-black text-white">{barbero.cantidadPortafolios ?? 0}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2.5 text-center text-sm font-black text-[#f5d77b] transition hover:bg-[#d4af37]/10"
          href={`/cliente/barberos/${barbero.idBarbero}`}
        >
          Ver perfil
        </Link>
        <Link
          className="rounded-lg bg-[#d4af37] px-4 py-2.5 text-center text-sm font-black text-black transition hover:bg-[#f5d77b]"
          href={`/cliente/reservas/nueva?idBarbero=${barbero.idBarbero}`}
        >
          Reservar
        </Link>
      </div>
    </article>
  );
}
