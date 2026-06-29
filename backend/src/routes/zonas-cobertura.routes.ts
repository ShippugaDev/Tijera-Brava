import { Router } from "express";
import {
  actualizarZonaCobertura,
  crearZonaCobertura,
  desactivarZonaCobertura,
  listarZonasCobertura
} from "../controllers/zonas-cobertura.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarZonaCoberturaSchema,
  crearZonaCoberturaSchema,
  filtrosZonasCoberturaSchema
} from "../validators/zonas-cobertura.validator";

const router = Router();

router.get("/", validarConsulta(filtrosZonasCoberturaSchema), listarZonasCobertura);

router.post(
  "/",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(crearZonaCoberturaSchema),
  crearZonaCobertura
);
router.patch(
  "/:idZonaCobertura",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idZonaCobertura")),
  validarSolicitud(actualizarZonaCoberturaSchema),
  actualizarZonaCobertura
);
router.delete(
  "/:idZonaCobertura",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idZonaCobertura")),
  desactivarZonaCobertura
);

export default router;
