"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormError } from "@/components/ui/FormMessage";
import { getEstadoBadgeClass } from "@/lib/status-styles";
import type { UsuarioAdmin } from "@/lib/types";

type CambiarEstadoUsuarioModalProps = {
  abierto: boolean;
  usuario: UsuarioAdmin | null;
  cargando?: boolean;
  error?: string;
  cancelLabel?: string;
  nombreEntidad?: string;
  textoDescripcion?: string;
  titulo?: string;
  onCerrar: () => void;
  onConfirmar: (estadoCuenta: string, motivo: string) => void;
};

const estados = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];

export function CambiarEstadoUsuarioModal({
  abierto,
  usuario,
  cargando = false,
  cancelLabel = "Volver",
  error = "",
  nombreEntidad,
  textoDescripcion,
  titulo = "Cambiar estado de usuario",
  onCerrar,
  onConfirmar
}: CambiarEstadoUsuarioModalProps) {
  const [estadoCuenta, setEstadoCuenta] = useState("ACTIVO");
  const [motivo, setMotivo] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (abierto) {
      const estadoActual = usuario?.estadoCuenta ?? "ACTIVO";
      setEstadoCuenta(estados.find((estado) => estado !== estadoActual) ?? "ACTIVO");
      setMotivo("");
      setErrorLocal("");
    }
  }, [abierto, usuario]);

  if (!abierto || !usuario) return null;

  const estadoActual = usuario.estadoCuenta ?? "PENDIENTE";
  const nombre = nombreEntidad || `${usuario.nombres} ${usuario.apellidos ?? ""}`.trim();

  const confirmar = () => {
    if (estadoCuenta === estadoActual) {
      setErrorLocal("Selecciona un estado diferente al actual.");
      return;
    }

    if (["INACTIVO", "SUSPENDIDO"].includes(estadoCuenta) && !motivo.trim()) {
      setErrorLocal("Ingresa un motivo para inactivar o suspender la cuenta.");
      return;
    }

    onConfirmar(estadoCuenta, motivo.trim());
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#0d0d0d] p-6 text-white shadow-2xl shadow-black/60">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
          Administración
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{titulo}</h2>
        <p className="mt-3 text-sm leading-6 text-[#b5b5b5]">
          {textoDescripcion ??
            `Selecciona el nuevo estado de la cuenta de ${nombre}. La gestión se realiza por estados, sin eliminación física de usuarios.`}
        </p>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-white/10 bg-[#050505] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b5b5b5]">
              Estado actual
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-black text-white">{nombre}</span>
              <Badge className={getEstadoBadgeClass(estadoActual)}>{estadoActual}</Badge>
            </div>
          </div>

          <label className="block text-sm font-semibold text-neutral-200">
            Nuevo estado
            <select
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              disabled={cargando}
              onChange={(event) => setEstadoCuenta(event.target.value)}
              value={estadoCuenta}
            >
              {estados.map((estado) => (
                <option disabled={estado === estadoActual} key={estado} value={estado}>
                  {estado === estadoActual ? `${estado} (actual)` : estado}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-neutral-200">
            Motivo del cambio
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              disabled={cargando}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ej. Incumplimiento de normas o reactivación de cuenta"
              value={motivo}
            />
          </label>
          <FormError mensaje={errorLocal || error} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="border-white/10 bg-[#050505] text-[#b5b5b5] hover:border-[#d4af37]/40 hover:text-white"
            disabled={cargando}
            onClick={onCerrar}
            type="button"
            variant="secondary"
          >
            {cancelLabel}
          </Button>
          <Button
            className="bg-[#d4af37] text-black hover:bg-[#f5d77b]"
            disabled={cargando}
            onClick={confirmar}
            type="button"
          >
            {cargando ? "Guardando..." : "Guardar cambio"}
          </Button>
        </div>
      </div>
    </div>
  );
}
