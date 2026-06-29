"use client";

import { ChangeEvent, FormEvent, useEffect, useId, useMemo, useState } from "react";
import { resolverUrlArchivo } from "@/lib/api";
import type { CategoriaCorte, PortafolioCorte } from "@/lib/types";
import type { PortafolioPayload } from "@/lib/barbero-portafolio-api";

type PortafolioFormProps = {
  categorias: CategoriaCorte[];
  cargando?: boolean;
  publicacion?: PortafolioCorte | null;
  submitLabel: string;
  onSubmit: (payload: PortafolioPayload) => void;
};

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
const tamanoMaximo = 5 * 1024 * 1024;

export function PortafolioForm({
  categorias,
  cargando = false,
  publicacion,
  submitLabel,
  onSubmit
}: PortafolioFormProps) {
  const inputId = useId();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [idCategoriaCorte, setIdCategoriaCorte] = useState("");
  const [destacado, setDestacado] = useState(false);
  const imagenActual = publicacion?.imagenUrl ?? null;
  const esEdicion = Boolean(publicacion);
  const previewVisible = useMemo(
    () => previewUrl ?? (esEdicion ? null : resolverUrlArchivo(imagenActual)),
    [esEdicion, imagenActual, previewUrl]
  );

  useEffect(() => {
    setTitulo(publicacion?.titulo ?? "");
    setDescripcion(publicacion?.descripcion ?? "");
    setImagen(null);
    setErrorArchivo("");
    setIdCategoriaCorte(publicacion?.categoria?.idCategoriaCorte ?? publicacion?.idCategoriaCorte ?? "");
    setDestacado(Boolean(publicacion?.destacado));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicacion]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const seleccionarImagen = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0] ?? null;
    setErrorArchivo("");
    setImagen(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (!archivo) return;
    if (!tiposPermitidos.includes(archivo.type)) {
      setErrorArchivo("El archivo debe ser JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > tamanoMaximo) {
      setErrorArchivo("La imagen no debe superar los 5 MB.");
      return;
    }

    setImagen(archivo);
    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      imagen,
      idCategoriaCorte,
      destacado
    });
  };

  return (
    <form className="grid gap-4" onSubmit={enviar}>
      <label className="block text-sm font-medium text-neutral-200">
        Título
        <input
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-neutral-200">
        Descripción
        <textarea
          className="mt-2 min-h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#d4af37]"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
        />
      </label>
      <div className="grid gap-3">
        {esEdicion ? (
          <>
            <p className="text-sm font-medium text-neutral-200">Imagen actual</p>
            <ImagenPreview imagenUrl={resolverUrlArchivo(imagenActual)} titulo={titulo || "Imagen actual"} />
            <p className="text-sm font-medium text-neutral-200">Reemplazar imagen</p>
          </>
        ) : (
          <p className="text-sm font-medium text-neutral-200">Imagen del trabajo</p>
        )}
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id={inputId}
          type="file"
          onChange={seleccionarImagen}
        />
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label
            className="inline-flex cursor-pointer justify-center rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#f5d77b]"
            htmlFor={inputId}
          >
            {esEdicion ? "Seleccionar nueva imagen" : "Seleccionar imagen"}
          </label>
          <span className="text-sm text-[#b5b5b5]">
            {imagen ? imagen.name : "Ningún archivo seleccionado"}
          </span>
        </div>
      </div>
      {imagen ? (
        <p className="text-sm text-[#f5d77b]">Archivo seleccionado: {imagen.name}</p>
      ) : esEdicion && publicacion?.imagenUrl ? (
        <p className="text-sm text-[#b5b5b5]">Se mantendrá la imagen actual si no seleccionas otra.</p>
      ) : (
        <p className="text-sm text-[#b5b5b5]">Selecciona una imagen para el portafolio.</p>
      )}
      {errorArchivo ? <p className="text-sm text-red-200">{errorArchivo}</p> : null}
      <div className="grid gap-2">
        <p className="text-sm font-medium text-neutral-200">Vista previa de imagen</p>
        <ImagenPreview imagenUrl={previewVisible} titulo={titulo || "Vista previa"} />
      </div>
      <label className="block text-sm font-medium text-neutral-200">
        Categoría
        <select
          className="mt-2 h-12 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-white outline-none focus:border-[#d4af37]"
          value={idCategoriaCorte}
          onChange={(event) => setIdCategoriaCorte(event.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.idCategoriaCorte} value={categoria.idCategoriaCorte}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex gap-3 rounded-lg border border-white/10 bg-[#171717] p-4 text-sm text-[#b5b5b5]">
        <input
          checked={destacado}
          className="h-4 w-4 accent-[#d4af37]"
          type="checkbox"
          onChange={(event) => setDestacado(event.target.checked)}
        />
        Marcar como destacado
      </label>
      <button
        className="rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-black text-black transition hover:bg-[#f5d77b] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={cargando}
        type="submit"
      >
        {cargando ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function ImagenPreview({ imagenUrl, titulo }: { imagenUrl?: string | null; titulo: string }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [imagenUrl]);

  if (!imagenUrl || fallo) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-[#d4af37]/25 bg-[#171717] px-5 text-center text-sm text-[#b5b5b5]">
        Vista previa no disponible
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#d4af37]/20 bg-black">
      <img
        alt={titulo}
        className="h-56 w-full object-cover"
        onError={() => setFallo(true)}
        src={imagenUrl}
      />
    </div>
  );
}
