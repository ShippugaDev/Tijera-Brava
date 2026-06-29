import type { RequestHandler } from "express";
import multer from "multer";
import { ErrorAplicacion } from "../errors/error-aplicacion";

const limiteTamano = 5 * 1024 * 1024;
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: limiteTamano,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!tiposPermitidos.includes(file.mimetype)) {
      callback(
        new ErrorAplicacion("El archivo debe ser una imagen JPG, PNG o WEBP.", 400)
      );
      return;
    }

    callback(null, true);
  }
});

export const subirFotoPerfil: RequestHandler = (req, res, next) => {
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
    { name: "fotografia", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ])(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(
          new ErrorAplicacion("La imagen supera el tamaño máximo permitido.", 413)
        );
        return;
      }

      next(new ErrorAplicacion("No se pudo subir la foto de perfil.", 400));
      return;
    }

    next(error);
  });
};

export const obtenerArchivoFotoPerfil = (
  files: Express.Multer.File[] | Record<string, Express.Multer.File[]> | undefined
) => {
  if (!files || Array.isArray(files)) return files?.[0] ?? null;

  return (
    files.foto?.[0] ??
    files.imagen?.[0] ??
    files.fotografia?.[0] ??
    files.avatar?.[0] ??
    null
  );
};
