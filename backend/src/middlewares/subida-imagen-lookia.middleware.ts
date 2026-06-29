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
      callback(new ErrorAplicacion("El archivo debe ser JPG, PNG o WEBP.", 400));
      return;
    }

    callback(null, true);
  }
});

export const subirImagenLookIA: RequestHandler = (req, res, next) => {
  upload.single("imagen")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new ErrorAplicacion("La imagen supera el tamaño máximo permitido.", 413));
        return;
      }

      next(new ErrorAplicacion("No se pudo subir la imagen para LookIA.", 400));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    if (typeof req.body.consentimientoAceptado === "string") {
      req.body.consentimientoAceptado = req.body.consentimientoAceptado === "true";
    }

    next();
  });
};
