export function getEstadoBadgeClass(estado?: string | null) {
  const value = String(estado ?? "").trim().toUpperCase();

  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em]";

  const verdeNeon =
    "border-emerald-300/80 bg-emerald-400/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)]";

  const ambarNeon =
    "border-amber-300/80 bg-amber-400/15 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.35)]";

  const rojoNeon =
    "border-red-400/80 bg-red-500/15 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.35)]";

  const doradoNeon =
    "border-yellow-300/80 bg-yellow-400/15 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.35)]";

  const neutro =
    "border-zinc-500/50 bg-zinc-500/10 text-zinc-300";

  if (
    [
      "ACTIVO",
      "ACTIVA",
      "APROBADO",
      "APROBADA",
      "VISIBLE",
      "DISPONIBLE",
      "CONFIRMADO",
      "CONFIRMADA",
      "FINALIZADO",
      "FINALIZADA",
      "COMPLETADO",
      "COMPLETADA",
      "COMPROBANTE_SUBIDO"
    ].includes(value)
  ) {
    return `${base} ${verdeNeon}`;
  }

  if (
    [
      "INACTIVO",
      "INACTIVA",
      "PENDIENTE",
      "PROCESANDO",
      "EN ESPERA",
      "EN_REVISION",
      "EN REVISIÓN",
      "EN_CAMINO",
      "EN_SERVICIO"
    ].includes(value)
  ) {
    return `${base} ${ambarNeon}`;
  }

  if (
    [
      "SUSPENDIDO",
      "SUSPENDIDA",
      "ELIMINADO",
      "ELIMINADA",
      "RECHAZADO",
      "RECHAZADA",
      "OCULTO",
      "OCULTA",
      "FALLIDA",
      "CANCELADA",
      "CANCELADO",
      "CANCELADA_CLIENTE",
      "CANCELADA_BARBERO",
      "CANCELADA_ADMINISTRACION",
      "DESACTIVADO",
      "DESACTIVADA"
    ].includes(value)
  ) {
    return `${base} ${rojoNeon}`;
  }

  if (
    [
      "DESTACADO",
      "DESTACADA",
      "PREMIUM",
      "PRINCIPAL"
    ].includes(value)
  ) {
    return `${base} ${doradoNeon}`;
  }

  return `${base} ${neutro}`;
}

export function getRolBadgeClass() {
  return "inline-flex items-center rounded-full border border-yellow-300/70 bg-yellow-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.25)]";
}
