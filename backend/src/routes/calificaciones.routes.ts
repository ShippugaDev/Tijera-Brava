import { Router } from "express";
import {
  crearCalificacion,
  listarMisCalificaciones,
  moderarCalificacion,
  obtenerCalificacion
} from "../controllers/calificaciones.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  crearCalificacionSchema,
  filtrosMisCalificacionesSchema,
  moderarCalificacionSchema
} from "../validators/calificaciones.validator";

const router = Router();

router.use(autenticarUsuario);

router.post(
  "/",
  autorizarRoles("CLIENTE"),
  validarSolicitud(crearCalificacionSchema),
  crearCalificacion
);
router.get(
  "/mis-calificaciones",
  autorizarRoles("CLIENTE"),
  validarConsulta(filtrosMisCalificacionesSchema),
  listarMisCalificaciones
);
router.get(
  "/:idCalificacion",
  validarParametros(uuidParam("idCalificacion")),
  obtenerCalificacion
);
router.patch(
  "/:idCalificacion/moderar",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idCalificacion")),
  validarSolicitud(moderarCalificacionSchema),
  moderarCalificacion
);

export default router;
