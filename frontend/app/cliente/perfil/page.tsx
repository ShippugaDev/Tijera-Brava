"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { resolverUrlArchivo } from "@/lib/api";
import {
  actualizarMiPerfilUsuario,
  obtenerMiPerfilUsuario,
  subirFotoPerfil
} from "@/lib/usuarios-api";
import type { UsuarioSesion } from "@/lib/types";

const sidebarItems = [
  "Buscar barberos",
  "Mis reservas",
  "LookIA",
  "Mis pagos",
  "Mis calificaciones",
  "Mi perfil"
];
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
const tamanoMaximo = 5 * 1024 * 1024;

const obtenerIniciales = (usuario: UsuarioSesion) =>
  `${usuario.nombres} ${usuario.apellidos ?? ""}`
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "TB";

export default function PerfilClientePage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <PerfilClienteContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function PerfilClienteContent({ usuario }: { usuario: UsuarioSesion }) {
  const [perfilActual, setPerfilActual] = useState(usuario);
  const [fotoActual, setFotoActual] = useState<string | null>(usuario.fotoPerfilUrl ?? null);
  const [nombres, setNombres] = useState(usuario.nombres);
  const [apellidos, setApellidos] = useState(usuario.apellidos ?? "");
  const [telefono, setTelefono] = useState(usuario.telefono ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fotoFallida, setFotoFallida] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const fotoVisible = useMemo(
    () => previewUrl ?? resolverUrlArchivo(fotoActual),
    [fotoActual, previewUrl]
  );

  useEffect(() => {
    setFotoFallida(false);
  }, [fotoVisible]);

  useEffect(() => {
    let activo = true;

    obtenerMiPerfilUsuario()
      .then((response) => {
        if (!activo) return;
        const perfil = response.datos.usuario;
        setPerfilActual(perfil);
        setFotoActual(perfil.fotoPerfilUrl ?? null);
        setNombres(perfil.nombres);
        setApellidos(perfil.apellidos ?? "");
        setTelefono(perfil.telefono ?? "");
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar todos los datos del perfil.");
      });

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
    setArchivo(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (!seleccionado) return;
    if (!tiposPermitidos.includes(seleccionado.type)) {
      setError("El archivo debe ser una imagen JPG, PNG o WEBP.");
      return;
    }
    if (seleccionado.size > tamanoMaximo) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setArchivo(seleccionado);
    setPreviewUrl(URL.createObjectURL(seleccionado));
  };

  const guardarFoto = async (event: FormEvent<HTMLFormElement>) => {
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
      const perfil = response.datos.usuario;
      setPerfilActual(perfil);
      setFotoActual(perfil.fotoPerfilUrl ?? null);
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

  const guardarDatos = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombresLimpios = nombres.trim();
    const apellidosLimpios = apellidos.trim();
    const telefonoLimpio = telefono.trim();

    if (nombresLimpios.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      setExito("");
      return;
    }
    if (!apellidosLimpios) {
      setError("Los apellidos no pueden estar vacíos.");
      setExito("");
      return;
    }
    if (!telefonoLimpio) {
      setError("El teléfono no puede estar vacío.");
      setExito("");
      return;
    }

    setGuardandoDatos(true);
    setError("");
    setExito("");
    try {
      const response = await actualizarMiPerfilUsuario({
        nombres: nombresLimpios,
        apellidos: apellidosLimpios,
        telefono: telefonoLimpio
      });
      const perfil = response.datos.usuario;
      setPerfilActual(perfil);
      setNombres(perfil.nombres);
      setApellidos(perfil.apellidos ?? "");
      setTelefono(perfil.telefono ?? "");
      setExito(response.mensaje || "Datos actualizados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron actualizar tus datos.");
    } finally {
      setGuardandoDatos(false);
    }
  };

  const usuarioActualizado = {
    ...perfilActual,
    fotoPerfilUrl: fotoActual ?? perfilActual.fotoPerfilUrl
  };

  return (
    <RoleLayout
      descripcion="Revisa tus datos y personaliza la imagen de tu cuenta."
      sidebarItems={sidebarItems}
      titulo="Mi perfil"
      usuario={usuarioActualizado}
    >
      <FormError mensaje={error} />
      <FormSuccess mensaje={exito} />

      <Card className="mt-4 border-[#d4af37]/20 bg-[#0d0d0d]">
        <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
          <div className="flex justify-center lg:justify-start">
            {fotoVisible && !fotoFallida ? (
              <img
                alt={`Foto de ${perfilActual.nombres}`}
                className="h-36 w-36 rounded-2xl border border-[#d4af37]/35 object-cover shadow-[0_0_35px_rgba(212,175,55,0.14)]"
                onError={() => setFotoFallida(true)}
                src={fotoVisible}
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[#2a2110] to-black text-4xl font-black text-[#f5d77b] shadow-[0_0_35px_rgba(212,175,55,0.14)]">
                {obtenerIniciales(perfilActual)}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d4af37]">
              CLIENTE
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              {`${perfilActual.nombres} ${perfilActual.apellidos ?? ""}`.trim()}
            </h2>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <Dato etiqueta="Correo" valor={perfilActual.correo ?? "No disponible"} />
              <Dato etiqueta="Rol" valor="Cliente" />
            </dl>

            <form className="mt-6 grid gap-4" onSubmit={guardarDatos}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Nombres"
                  onChange={setNombres}
                  required
                  value={nombres}
                />
                <Campo
                  label="Apellidos"
                  onChange={setApellidos}
                  required
                  value={apellidos}
                />
              </div>
              <Campo
                label="Teléfono"
                onChange={setTelefono}
                required
                type="tel"
                value={telefono}
              />
              <div>
                <Button
                  className="bg-[#d4af37] text-black hover:bg-[#f5d77b]"
                  disabled={guardandoDatos}
                  type="submit"
                >
                  {guardandoDatos ? "Guardando..." : "Guardar datos"}
                </Button>
              </div>
            </form>

            <form className="mt-8 space-y-4 border-t border-white/10 pt-6" onSubmit={guardarFoto}>
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
                  {subiendo ? "Subiendo..." : "Guardar foto"}
                </Button>
                <p className="text-sm text-[#b5b5b5]">JPG, PNG o WEBP. Máximo 5 MB.</p>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </RoleLayout>
  );
}

function Campo({
  label,
  onChange,
  type = "text",
  value,
  required = false
}: {
  label: string;
  onChange: (value: string) => void;
  type?: "text" | "tel";
  value: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-[#f5d77b]">
      {label}
      <input
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#050505] px-4 text-white outline-none transition focus:border-[#d4af37]"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/35 p-4">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-[#d4af37]">
        {etiqueta}
      </dt>
      <dd className="mt-2 break-words text-sm text-[#e5e5e5]">{valor}</dd>
    </div>
  );
}
