import { Router } from "express";
import {
  actualizarServicio,
  crearServicio,
  desactivarServicio,
  listarServicios,
  obtenerServicio
} from "../controllers/servicios.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarServicioSchema,
  crearServicioSchema,
  filtrosServiciosSchema
} from "../validators/servicios.validator";

const router = Router();

router.get("/", validarConsulta(filtrosServiciosSchema), listarServicios);
router.get(
  "/:idServicio",
  validarParametros(uuidParam("idServicio")),
  obtenerServicio
);

router.post(
  "/",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(crearServicioSchema),
  crearServicio
);
router.patch(
  "/:idServicio",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idServicio")),
  validarSolicitud(actualizarServicioSchema),
  actualizarServicio
);
router.delete(
  "/:idServicio",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idServicio")),
  desactivarServicio
);

export default router;
