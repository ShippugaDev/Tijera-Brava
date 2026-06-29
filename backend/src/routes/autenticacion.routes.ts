import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  cerrarSesion,
  iniciarSesion,
  obtenerMiSesion,
  registrarBarbero,
  registrarCliente
} from "../controllers/autenticacion.controller";
import { validarSolicitud } from "../middlewares/validar-solicitud.middleware";
import {
  iniciarSesionSchema,
  registroBarberoSchema,
  registroClienteSchema
} from "../validators/autenticacion.validator";

const router = Router();

const limitadorAutenticacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    exito: false,
    mensaje: "Demasiadas solicitudes, intenta nuevamente más tarde",
    errores: []
  }
});

router.post(
  "/registro-cliente",
  limitadorAutenticacion,
  validarSolicitud(registroClienteSchema),
  registrarCliente
);

router.post(
  "/registro-barbero",
  limitadorAutenticacion,
  validarSolicitud(registroBarberoSchema),
  registrarBarbero
);

router.post(
  "/iniciar-sesion",
  limitadorAutenticacion,
  validarSolicitud(iniciarSesionSchema),
  iniciarSesion
);

router.get("/mi-sesion", obtenerMiSesion);
router.post("/cerrar-sesion", cerrarSesion);

export default router;
