import { Router } from "express";
import {
  actualizarMiPerfilBarbero,
  aprobarBarbero,
  listarBarberosPublicos,
  listarBarberosPendientes,
  obtenerBarberoPublico,
  obtenerMiPerfilBarbero,
  rechazarBarbero,
  suspenderBarbero
} from "../controllers/barberos.controller";
import { listarCalificacionesPublicas } from "../controllers/calificaciones.controller";
import { consultarDisponibilidadPublica } from "../controllers/disponibilidad.controller";
import { listarPortafolioPublico } from "../controllers/portafolios.controller";
import {
  asignarEspecialidadBarbero,
  listarEspecialidadesPublicasBarbero,
  listarMisEspecialidadesBarbero,
  retirarEspecialidadBarbero
} from "../controllers/especialidades.controller";
import {
  asignarServicioBarbero,
  actualizarServicioBarbero,
  listarMisServiciosBarbero,
  listarServiciosPublicosBarbero,
  retirarServicioBarbero
} from "../controllers/servicios.controller";
import {
  asignarZonaBarbero,
  actualizarZonaBarbero,
  listarMisZonasBarbero,
  listarZonasPublicasBarbero,
  retirarZonaBarbero
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
  asignarEspecialidadSchema
} from "../validators/especialidades.validator";
import {
  actualizarPerfilBarberoSchema,
  filtrosBarberosPublicosSchema,
  filtrosBarberosPendientesSchema,
  rechazarBarberoSchema
} from "../validators/barberos.validator";
import {
  asignarServicioBarberoSchema,
  actualizarServicioBarberoSchema
} from "../validators/servicios.validator";
import {
  asignarZonaBarberoSchema,
  actualizarZonaBarberoSchema
} from "../validators/zonas-cobertura.validator";
import { consultaDisponibilidadSchema } from "../validators/disponibilidad.validator";
import { filtrosCalificacionesPublicasSchema } from "../validators/calificaciones.validator";
import { filtrosPortafolioPublicoSchema } from "../validators/portafolios.validator";

const router = Router();

router.get(
  "/",
  validarConsulta(filtrosBarberosPublicosSchema),
  listarBarberosPublicos
);

router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/calificaciones",
  validarParametros(uuidParam("idBarbero")),
  validarConsulta(filtrosCalificacionesPublicasSchema),
  listarCalificacionesPublicas
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/portafolio",
  validarParametros(uuidParam("idBarbero")),
  validarConsulta(filtrosPortafolioPublicoSchema),
  listarPortafolioPublico
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/disponibilidad",
  validarParametros(uuidParam("idBarbero")),
  validarConsulta(consultaDisponibilidadSchema),
  consultarDisponibilidadPublica
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/servicios",
  validarParametros(uuidParam("idBarbero")),
  listarServiciosPublicosBarbero
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/especialidades",
  validarParametros(uuidParam("idBarbero")),
  listarEspecialidadesPublicasBarbero
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})/zonas",
  validarParametros(uuidParam("idBarbero")),
  listarZonasPublicasBarbero
);
router.get(
  "/:idBarbero([0-9a-fA-F-]{36})",
  validarParametros(uuidParam("idBarbero")),
  obtenerBarberoPublico
);

router.use(autenticarUsuario);

router.get("/mi-perfil", autorizarRoles("BARBERO"), obtenerMiPerfilBarbero);
router.patch(
  "/mi-perfil",
  autorizarRoles("BARBERO"),
  validarSolicitud(actualizarPerfilBarberoSchema),
  actualizarMiPerfilBarbero
);

router.get(
  "/mi-perfil/servicios",
  autorizarRoles("BARBERO"),
  listarMisServiciosBarbero
);
router.post(
  "/mi-perfil/servicios",
  autorizarRoles("BARBERO"),
  validarSolicitud(asignarServicioBarberoSchema),
  asignarServicioBarbero
);
router.patch(
  "/mi-perfil/servicios/:idServicioBarbero",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idServicioBarbero")),
  validarSolicitud(actualizarServicioBarberoSchema),
  actualizarServicioBarbero
);
router.delete(
  "/mi-perfil/servicios/:idServicioBarbero",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idServicioBarbero")),
  retirarServicioBarbero
);

router.get(
  "/mi-perfil/especialidades",
  autorizarRoles("BARBERO"),
  listarMisEspecialidadesBarbero
);
router.post(
  "/mi-perfil/especialidades",
  autorizarRoles("BARBERO"),
  validarSolicitud(asignarEspecialidadSchema),
  asignarEspecialidadBarbero
);
router.delete(
  "/mi-perfil/especialidades/:idEspecialidadBarbero",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idEspecialidadBarbero")),
  retirarEspecialidadBarbero
);

router.get(
  "/mi-perfil/zonas",
  autorizarRoles("BARBERO"),
  listarMisZonasBarbero
);
router.post(
  "/mi-perfil/zonas",
  autorizarRoles("BARBERO"),
  validarSolicitud(asignarZonaBarberoSchema),
  asignarZonaBarbero
);
router.patch(
  "/mi-perfil/zonas/:idZonaBarbero",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idZonaBarbero")),
  validarSolicitud(actualizarZonaBarberoSchema),
  actualizarZonaBarbero
);
router.delete(
  "/mi-perfil/zonas/:idZonaBarbero",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idZonaBarbero")),
  retirarZonaBarbero
);

router.get(
  "/administracion/pendientes",
  autorizarRoles("ADMINISTRADOR"),
  validarConsulta(filtrosBarberosPendientesSchema),
  listarBarberosPendientes
);
router.patch(
  "/:idBarbero/aprobar",
  autorizarRoles("ADMINISTRADOR"),
  aprobarBarbero
);
router.patch(
  "/:idBarbero/rechazar",
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(rechazarBarberoSchema),
  rechazarBarbero
);
router.patch(
  "/:idBarbero/suspender",
  autorizarRoles("ADMINISTRADOR"),
  suspenderBarbero
);

export default router;
