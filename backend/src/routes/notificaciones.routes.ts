import { Router } from "express";
import {
  contarMisNotificacionesNoLeidas,
  listarMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas
} from "../controllers/notificaciones.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import {
  validarConsulta,
  validarParametros
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import { filtrosNotificacionesSchema } from "../validators/notificaciones.validator";

const router = Router();

router.use(autenticarUsuario);

router.get("/", validarConsulta(filtrosNotificacionesSchema), listarMisNotificaciones);
router.get("/no-leidas/total", contarMisNotificacionesNoLeidas);
router.patch("/leer-todas", marcarTodasNotificacionesLeidas);
router.patch(
  "/:idNotificacion/leer",
  validarParametros(uuidParam("idNotificacion")),
  marcarNotificacionLeida
);

export default router;
