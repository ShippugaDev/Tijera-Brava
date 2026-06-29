import { Router } from "express";
import {
  obtenerActividadReciente,
  obtenerDashboardAdministracion,
  obtenerEstadisticasBarberos,
  obtenerEstadisticasLookIA,
  obtenerEstadisticasPagos,
  obtenerEstadisticasReservas,
  obtenerEstadisticasServicios,
  listarCalificacionesModeracion,
  listarPortafoliosModeracion
} from "../controllers/administracion.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import { validarConsulta } from "../middlewares/validar-solicitud.middleware";
import {
  filtrosActividadRecienteAdminSchema,
  filtrosBarberosAdminSchema,
  filtrosLookIAAdminSchema,
  filtrosModeracionAdminSchema,
  filtrosPagosAdminSchema,
  filtrosReservasAdminSchema,
  filtrosServiciosAdminSchema
} from "../validators/administracion.validator";

const router = Router();

router.use(autenticarUsuario);
router.use(autorizarRoles("ADMINISTRADOR"));

router.get("/dashboard", obtenerDashboardAdministracion);
router.get(
  "/estadisticas/reservas",
  validarConsulta(filtrosReservasAdminSchema),
  obtenerEstadisticasReservas
);
router.get(
  "/estadisticas/pagos",
  validarConsulta(filtrosPagosAdminSchema),
  obtenerEstadisticasPagos
);
router.get(
  "/estadisticas/servicios",
  validarConsulta(filtrosServiciosAdminSchema),
  obtenerEstadisticasServicios
);
router.get(
  "/estadisticas/barberos",
  validarConsulta(filtrosBarberosAdminSchema),
  obtenerEstadisticasBarberos
);
router.get(
  "/estadisticas/lookia",
  validarConsulta(filtrosLookIAAdminSchema),
  obtenerEstadisticasLookIA
);
router.get(
  "/actividad-reciente",
  validarConsulta(filtrosActividadRecienteAdminSchema),
  obtenerActividadReciente
);
router.get(
  "/moderacion/portafolios",
  validarConsulta(filtrosModeracionAdminSchema),
  listarPortafoliosModeracion
);
router.get(
  "/moderacion/calificaciones",
  validarConsulta(filtrosModeracionAdminSchema),
  listarCalificacionesModeracion
);

export default router;
