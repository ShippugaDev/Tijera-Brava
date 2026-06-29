import { Router } from "express";
import {
  actualizarEspecialidad,
  crearEspecialidad,
  desactivarEspecialidad,
  listarEspecialidades
} from "../controllers/especialidades.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarEspecialidadSchema,
  crearEspecialidadSchema,
  filtrosEspecialidadesSchema
} from "../validators/especialidades.validator";

const router = Router();

router.get("/", validarConsulta(filtrosEspecialidadesSchema), listarEspecialidades);

router.post(
  "/",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(crearEspecialidadSchema),
  crearEspecialidad
);
router.patch(
  "/:idEspecialidad",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idEspecialidad")),
  validarSolicitud(actualizarEspecialidadSchema),
  actualizarEspecialidad
);
router.delete(
  "/:idEspecialidad",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idEspecialidad")),
  desactivarEspecialidad
);

export default router;
