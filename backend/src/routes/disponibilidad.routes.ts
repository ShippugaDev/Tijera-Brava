import { Router } from "express";
import {
  actualizarBloqueo,
  actualizarHorario,
  crearBloqueo,
  crearHorario,
  desactivarBloqueo,
  desactivarHorario,
  listarMisBloqueos,
  listarMisHorarios,
  reactivarHorario
} from "../controllers/disponibilidad.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarBloqueoSchema,
  actualizarHorarioSchema,
  crearBloqueoSchema,
  crearHorarioSchema,
  filtrosBloqueosSchema
} from "../validators/disponibilidad.validator";

const router = Router();

router.use(autenticarUsuario);
router.use(autorizarRoles("BARBERO"));

router.get("/mis-horarios", listarMisHorarios);
router.post("/mis-horarios", validarSolicitud(crearHorarioSchema), crearHorario);
router.patch(
  "/mis-horarios/:idHorarioDisponibilidad/reactivar",
  validarParametros(uuidParam("idHorarioDisponibilidad")),
  reactivarHorario
);
router.patch(
  "/mis-horarios/:idHorarioDisponibilidad",
  validarParametros(uuidParam("idHorarioDisponibilidad")),
  validarSolicitud(actualizarHorarioSchema),
  actualizarHorario
);
router.delete(
  "/mis-horarios/:idHorarioDisponibilidad",
  validarParametros(uuidParam("idHorarioDisponibilidad")),
  desactivarHorario
);

router.get(
  "/mis-bloqueos",
  validarConsulta(filtrosBloqueosSchema),
  listarMisBloqueos
);
router.post("/mis-bloqueos", validarSolicitud(crearBloqueoSchema), crearBloqueo);
router.patch(
  "/mis-bloqueos/:idBloqueoHorario",
  validarParametros(uuidParam("idBloqueoHorario")),
  validarSolicitud(actualizarBloqueoSchema),
  actualizarBloqueo
);
router.delete(
  "/mis-bloqueos/:idBloqueoHorario",
  validarParametros(uuidParam("idBloqueoHorario")),
  desactivarBloqueo
);

export default router;
