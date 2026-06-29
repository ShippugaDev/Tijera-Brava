"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { resolverUrlArchivo } from "@/lib/api";
import {
  obtenerMiPerfilBarbero,
  type PerfilBarberoPrivado
} from "@/lib/barbero-perfil-api";
import { obtenerMiPerfilUsuario, subirFotoPerfil } from "@/lib/usuarios-api";
import type { UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Mis reservas",
  "Mi disponibilidad",
  "Mi portafolio",
  "Mis servicios",
  "Mis notificaciones",
  "Mi perfil"
];

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
const tamanoMaximo = 2 * 1024 * 1024;

const obtenerIniciales = (usuario: UsuarioSesion, nombreProfesional?: string | null) =>
  (nombreProfesional || `${usuario.nombres} ${usuario.apellidos ?? ""}`.trim() || "Barbero")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "TB";

function FotoPerfilPreview({
  iniciales,
  url
}: {
  iniciales: string;
  url?: string | null;
}) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [url]);

  if (!url || fallo) {
    return (
      <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[#2a2110] to-black text-4xl font-black text-[#f5d77b] shadow-[0_0_35px_rgba(212,175,55,0.14)]">
        {iniciales}
      </div>
    );
  }

  return (
    <div className="h-36 w-36 overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-black shadow-[0_0_35px_rgba(212,175,55,0.14)]">
      <img
        alt="Foto de perfil del barbero"
        className="h-full w-full object-cover"
        onError={() => setFallo(true)}
        src={url}
      />
    </div>
  );
}

export default function PerfilBarberoPage() {
  return (
    <ProtectedRoute rolPermitido="BARBERO">
      {(usuario) => <PerfilBarberoContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function PerfilBarberoContent({ usuario }: { usuario: UsuarioSesion }) {
  const [perfil, setPerfil] = useState<PerfilBarberoPrivado | null>(null);
  const [fotoActual, setFotoActual] = useState<string | null>(usuario.fotoPerfilUrl ?? null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const nombreProfesional = perfil?.barbero.nombreProfesional;
  const iniciales = obtenerIniciales(usuario, nombreProfesional);
  const fotoVisible = useMemo(
    () => previewUrl ?? resolverUrlArchivo(fotoActual),
    [fotoActual, previewUrl]
  );

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      setCargando(true);
      setError("");
      try {
        const [perfilResponse, usuarioResponse] = await Promise.allSettled([
          obtenerMiPerfilBarbero(),
          obtenerMiPerfilUsuario()
        ]);

        if (!activo) return;

        if (perfilResponse.status === "fulfilled") {
          setPerfil(perfilResponse.value.datos);
          setFotoActual(
            perfilResponse.value.datos.usuario.fotoPerfilUrl ??
              perfilResponse.value.datos.barbero.fotoPerfilUrl ??
              null
          );
        }

        if (usuarioResponse.status === "fulfilled") {
          setFotoActual(usuarioResponse.value.datos.usuario.fotoPerfilUrl ?? null);
        }
      } catch {
        setError("No se pudo cargar tu perfil.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarPerfil();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const seleccionarArchivo = (event: ChangeEvent<HTMLInputElement>) => {
    const seleccionado = event.target.files?.[0] ?? null;
    setError("");
    setExito("");

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setArchivo(null);

    if (!seleccionado) return;

    if (!tiposPermitidos.includes(seleccionado.type)) {
      setError("El archivo debe ser una imagen JPG, PNG o WEBP.");
      return;
    }

    if (seleccionado.size > tamanoMaximo) {
      setError("La imagen supera el tamaño máximo permitido.");
      return;
    }

    setArchivo(seleccionado);
    setPreviewUrl(URL.createObjectURL(seleccionado));
  };

  const enviarFoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!archivo) {
      setError("Selecciona una imagen para subir.");
      return;
    }

    setSubiendo(true);
    setError("");
    setExito("");

    try {
      const response = await subirFotoPerfil(archivo);
      const nuevaFoto = response.datos.usuario.fotoPerfilUrl ?? null;
      setFotoActual(nuevaFoto);
      setArchivo(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setExito(response.mensaje || "Foto de perfil actualizada correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto de perfil.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Actualiza la imagen que verán tus clientes en el listado y perfil público."
      sidebarItems={sidebarItems}
      titulo="Mi perfil"
      usuario={{ ...usuario, fotoPerfilUrl: fotoActual ?? usuario.fotoPerfilUrl }}
    >
      {cargando ? <Loading texto="Cargando perfil..." /> : null}
      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      <Card className="mt-4 border-[#d4af37]/20 bg-[#0d0d0d]">
        <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
          <div className="flex justify-center lg:justify-start">
            <FotoPerfilPreview iniciales={iniciales} url={fotoVisible} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
              BARBERO
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              {nombreProfesional ?? `${usuario.nombres} ${usuario.apellidos ?? ""}`.trim()}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#b5b5b5]">
              {perfil?.barbero.biografia ??
                "Sube una foto clara para que tus clientes reconozcan tu perfil al reservar."}
            </p>

            <form className="mt-6 space-y-4" onSubmit={enviarFoto}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#f5d77b]">
                  Foto de perfil
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-sm text-[#b5b5b5] file:mr-4 file:rounded-md file:border-0 file:bg-[#d4af37] file:px-4 file:py-2 file:text-sm file:font-black file:text-black hover:border-[#d4af37]/45"
                  onChange={seleccionarArchivo}
                  type="file"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="bg-[#d4af37] text-black hover:bg-[#f5d77b]"
                  disabled={subiendo || !archivo}
                  type="submit"
                >
                  {subiendo ? "Subiendo..." : "Subir foto"}
                </Button>
                <p className="text-sm text-[#b5b5b5]">
                  JPG, PNG o WEBP. Tamaño máximo: 2 MB.
                </p>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </RoleLayout>
  );
}
