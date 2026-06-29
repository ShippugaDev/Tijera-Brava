"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EstiloLookIACard } from "@/components/cliente/lookia/EstiloLookIACard";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { FormError, FormSuccess } from "@/components/ui/FormMessage";
import { Loading } from "@/components/ui/Loading";
import { crearSimulacionLookIA, listarEstilosLookIA } from "@/lib/lookia-api";
import type { EstiloLookIA, UsuarioSesion } from "@/lib/types";

const sidebarItems = ["Buscar barberos", "Mis reservas", "LookIA", "Mis pagos", "Mis calificaciones"];
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
const tamanoMaximo = 5 * 1024 * 1024;

export default function NuevaSimulacionLookIAPage() {
  return (
    <ProtectedRoute rolPermitido="CLIENTE">
      {(usuario) => <NuevaSimulacionContent usuario={usuario} />}
    </ProtectedRoute>
  );
}

function NuevaSimulacionContent({ usuario }: { usuario: UsuarioSesion }) {
  const router = useRouter();
  const inputImagenId = useId();
  const [estilos, setEstilos] = useState<EstiloLookIA[]>([]);
  const [idEstiloLookIA, setIdEstiloLookIA] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    let activo = true;
    listarEstilosLookIA()
      .then((response) => {
        if (!activo) return;
        setEstilos(response.datos ?? []);
      })
      .catch(() => {
        if (!activo) return;
        setError("No se pudieron cargar los estilos.");
      })
      .finally(() => {
        if (activo) setCargando(false);
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

  const seleccionarImagen = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0] ?? null;
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImagen(null);

    if (!archivo) return;
    if (!tiposPermitidos.includes(archivo.type)) {
      setError("El archivo debe ser JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > tamanoMaximo) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setImagen(archivo);
    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const crear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setExito("");

    if (!idEstiloLookIA) {
      setError("Debes seleccionar un estilo.");
      return;
    }
    if (!imagen) {
      setError("Selecciona una foto para generar la simulación.");
      return;
    }
    if (!consentimientoAceptado) {
      setError("Debes aceptar el consentimiento para usar LookIA.");
      return;
    }

    setCreando(true);
    try {
      const response = await crearSimulacionLookIA({
        idEstiloLookIA,
        imagen,
        consentimientoAceptado
      });
      const idSimulacion = response.datos?.simulacion?.idSimulacionLookIA;
      setExito("Simulación creada correctamente.");
      router.push(idSimulacion ? `/cliente/lookia/${idSimulacion}` : "/cliente/lookia");
    } catch {
      setError("No se pudo crear la simulación.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <RoleLayout
      descripcion="Elige un estilo, sube una foto clara y genera una simulación inicial."
      sidebarItems={sidebarItems}
      titulo="Nueva simulación LookIA"
      usuario={usuario}
    >
      <div className="mb-6">
        <Link className="text-sm font-black text-[#f5d77b] hover:text-white" href="/cliente/lookia">
          Volver a LookIA
        </Link>
      </div>

      <div className="space-y-4">
        <FormError mensaje={error} />
        <FormSuccess mensaje={exito} />
      </div>

      {cargando ? <Loading texto="Cargando estilos LookIA..." /> : null}

      {!cargando && estilos.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-[#0d0d0d] p-8 text-center text-[#b5b5b5]">
          No hay estilos disponibles para crear simulaciones.
        </div>
      ) : null}

      {!cargando && estilos.length > 0 ? (
        <form className="mt-5 space-y-6" onSubmit={crear}>
          <section>
            <h2 className="text-xl font-black text-white">Estilos disponibles</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {estilos.map((estilo) => (
                <EstiloLookIACard
                  estilo={estilo}
                  key={estilo.idEstiloLookIA}
                  onSelect={setIdEstiloLookIA}
                  seleccionado={idEstiloLookIA === estilo.idEstiloLookIA}
                />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] p-5">
            <h2 className="text-xl font-black text-white">Datos de la simulación</h2>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-200">Foto para simulación</p>
                  <p className="mt-1 text-sm text-[#b5b5b5]">
                    Sube una foto clara de tu rostro para generar una simulación de estilo.
                  </p>
                </div>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id={inputImagenId}
                  onChange={seleccionarImagen}
                  type="file"
                />
                <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <label
                    className="inline-flex cursor-pointer justify-center rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b]"
                    htmlFor={inputImagenId}
                  >
                    Seleccionar imagen
                  </label>
                  <span className="text-sm text-[#b5b5b5]">
                    {imagen ? imagen.name : "Ningún archivo seleccionado"}
                  </span>
                </div>
                <ImagenPreview imagenUrl={previewUrl} />
              </div>
              <label className="flex gap-3 rounded-lg border border-white/10 bg-[#171717] p-4 text-sm leading-6 text-[#b5b5b5]">
                <input
                  checked={consentimientoAceptado}
                  className="mt-1 h-4 w-4 accent-[#d4af37]"
                  onChange={(event) => setConsentimientoAceptado(event.target.checked)}
                  type="checkbox"
                />
                Acepto usar esta imagen para generar una simulación de estilo LookIA.
              </label>
            </div>
            <button
              className="mt-5 w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={creando}
              type="submit"
            >
              {creando ? "Creando simulación..." : "Crear simulación"}
            </button>
          </section>
        </form>
      ) : null}
    </RoleLayout>
  );
}

function ImagenPreview({ imagenUrl }: { imagenUrl?: string | null }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [imagenUrl]);

  if (!imagenUrl || fallo) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#d4af37]/25 bg-black/30 px-5 text-center text-sm text-[#b5b5b5]">
        Vista previa no disponible
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
      <img
        alt="Vista previa de foto LookIA"
        className="h-64 w-full object-cover"
        onError={() => setFallo(true)}
        src={imagenUrl}
      />
    </div>
  );
}
