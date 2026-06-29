import { Router } from "express";
import {
  actualizarEstiloLookIA,
  crearEstiloLookIA,
  crearSimulacionLookIA,
  desactivarEstiloLookIA,
  eliminarSimulacionLookIA,
  listarBarberosRecomendadosLookIA,
  listarEstilosLookIA,
  listarMisSimulacionesLookIA,
  obtenerEstiloLookIA,
  obtenerSimulacionLookIA,
  regenerarSimulacionLookIA
} from "../controllers/lookia.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import { subirImagenLookIA } from "../middlewares/subida-imagen-lookia.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarEstiloLookIASchema,
  crearEstiloLookIASchema,
  crearSimulacionLookIASchema,
  filtrosEstilosLookIASchema,
  filtrosSimulacionesLookIASchema
} from "../validators/lookia.validator";

const router = Router();

router.use(autenticarUsuario);

router.get(
  "/estilos",
  validarConsulta(filtrosEstilosLookIASchema),
  listarEstilosLookIA
);
router.get(
  "/estilos/:idEstiloLookIA",
  validarParametros(uuidParam("idEstiloLookIA")),
  obtenerEstiloLookIA
);
router.post(
  "/estilos",
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(crearEstiloLookIASchema),
  crearEstiloLookIA
);
router.patch(
  "/estilos/:idEstiloLookIA",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idEstiloLookIA")),
  validarSolicitud(actualizarEstiloLookIASchema),
  actualizarEstiloLookIA
);
router.delete(
  "/estilos/:idEstiloLookIA",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idEstiloLookIA")),
  desactivarEstiloLookIA
);

router.post(
  "/simulaciones",
  autorizarRoles("CLIENTE"),
  subirImagenLookIA,
  validarSolicitud(crearSimulacionLookIASchema),
  crearSimulacionLookIA
);
router.get(
  "/simulaciones",
  autorizarRoles("CLIENTE"),
  validarConsulta(filtrosSimulacionesLookIASchema),
  listarMisSimulacionesLookIA
);
router.get(
  "/simulaciones/:idSimulacionLookIA",
  autorizarRoles("CLIENTE", "ADMINISTRADOR"),
  validarParametros(uuidParam("idSimulacionLookIA")),
  obtenerSimulacionLookIA
);
router.post(
  "/simulaciones/:idSimulacionLookIA/regenerar",
  autorizarRoles("CLIENTE"),
  validarParametros(uuidParam("idSimulacionLookIA")),
  regenerarSimulacionLookIA
);
router.delete(
  "/simulaciones/:idSimulacionLookIA",
  autorizarRoles("CLIENTE"),
  validarParametros(uuidParam("idSimulacionLookIA")),
  eliminarSimulacionLookIA
);
router.get(
  "/simulaciones/:idSimulacionLookIA/barberos-recomendados",
  autorizarRoles("CLIENTE"),
  validarParametros(uuidParam("idSimulacionLookIA")),
  listarBarberosRecomendadosLookIA
);

export default router;
