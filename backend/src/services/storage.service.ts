import { supabaseAdmin } from "../config/supabase";
import { ErrorAplicacion } from "../errors/error-aplicacion";

const EXTENSION_POR_TIPO: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

export async function subirImagenASupabaseStorage(params: {
  bucket: string;
  carpeta: string;
  archivo: Express.Multer.File;
  prefijo: string;
}): Promise<string> {
  const { bucket, carpeta, archivo, prefijo } = params;

  if (!archivo) {
    throw new ErrorAplicacion("No se recibió la imagen.", 400);
  }

  if (!archivo.buffer?.length) {
    throw new ErrorAplicacion("La imagen recibida no contiene datos.", 400);
  }

  const extension = EXTENSION_POR_TIPO[archivo.mimetype];
  if (!extension) {
    throw new ErrorAplicacion(
      "Formato de imagen no permitido. Usa JPG, PNG o WEBP.",
      400
    );
  }

  const prefijoSeguro = prefijo.replace(/[^a-zA-Z0-9_-]/g, "") || "imagen";
  const nombreSeguro = `${prefijoSeguro}-${Date.now()}-${Math.round(
    Math.random() * 1_000_000
  )}${extension}`;

  const rutaArchivo = carpeta ? `${carpeta}/${nombreSeguro}` : nombreSeguro;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(rutaArchivo, archivo.buffer, {
      contentType: archivo.mimetype,
      upsert: true
    });

  if (error) {
    throw new ErrorAplicacion(
      `Error al subir imagen a Supabase Storage: ${error.message}`,
      502
    );
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(rutaArchivo);

  if (!data.publicUrl) {
    throw new ErrorAplicacion(
      "Supabase Storage no devolvió la URL pública de la imagen.",
      502
    );
  }

  return data.publicUrl;
}
