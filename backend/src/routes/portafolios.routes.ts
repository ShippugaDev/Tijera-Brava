import { Router } from "express";
import {
  actualizarPortafolio,
  crearPortafolio,
  eliminarPortafolio,
  listarMiPortafolio,
  moderarPortafolio
} from "../controllers/portafolios.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import { subirImagenPortafolio } from "../middlewares/subida-imagen-portafolio.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarPortafolioSchema,
  crearPortafolioSchema,
  filtrosMiPortafolioSchema,
  moderarPortafolioSchema
} from "../validators/portafolios.validator";

const router = Router();

router.use(autenticarUsuario);

router.get(
  "/mi-portafolio",
  autorizarRoles("BARBERO"),
  validarConsulta(filtrosMiPortafolioSchema),
  listarMiPortafolio
);
router.post(
  "/",
  autorizarRoles("BARBERO"),
  subirImagenPortafolio,
  validarSolicitud(crearPortafolioSchema),
  crearPortafolio
);
router.patch(
  "/:idPortafolioCorte",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idPortafolioCorte")),
  subirImagenPortafolio,
  validarSolicitud(actualizarPortafolioSchema),
  actualizarPortafolio
);
router.delete(
  "/:idPortafolioCorte",
  autorizarRoles("BARBERO"),
  validarParametros(uuidParam("idPortafolioCorte")),
  eliminarPortafolio
);
router.patch(
  "/:idPortafolioCorte/moderar",
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idPortafolioCorte")),
  validarSolicitud(moderarPortafolioSchema),
  moderarPortafolio
);

export default router;
