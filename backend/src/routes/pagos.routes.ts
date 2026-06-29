import { Router } from "express";
import {
  cancelarPago,
  confirmarPago,
  obtenerHistorialPago,
  reembolsarPago
} from "../controllers/pagos.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  observacionObligatoriaSchema,
  observacionOpcionalSchema
} from "../validators/pagos.validator";

const router = Router();

router.use(autenticarUsuario);

router.patch(
  "/:idPago/confirmar",
  autorizarRoles("BARBERO", "ADMINISTRADOR"),
  validarParametros(uuidParam("idPago")),
  validarSolicitud(observacionOpcionalSchema),
  confirmarPago
);
router.patch(
  "/:idPago/cancelar",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idPago")),
  validarSolicitud(observacionObligatoriaSchema),
  cancelarPago
);
router.patch(
  "/:idPago/reembolsar",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idPago")),
  validarSolicitud(observacionObligatoriaSchema),
  reembolsarPago
);
router.get(
  "/:idPago/historial",
  validarParametros(uuidParam("idPago")),
  obtenerHistorialPago
);

export default router;
