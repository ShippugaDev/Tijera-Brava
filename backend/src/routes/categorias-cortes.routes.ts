import { Router } from "express";
import {
  actualizarCategoriaCorte,
  crearCategoriaCorte,
  desactivarCategoriaCorte,
  listarCategoriasCortes,
  obtenerCategoriaCorte
} from "../controllers/categorias-cortes.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  actualizarCategoriaCorteSchema,
  crearCategoriaCorteSchema,
  filtrosCategoriasCortesSchema
} from "../validators/categorias-cortes.validator";

const router = Router();

router.get("/", validarConsulta(filtrosCategoriasCortesSchema), listarCategoriasCortes);
router.get(
  "/:idCategoriaCorte",
  validarParametros(uuidParam("idCategoriaCorte")),
  obtenerCategoriaCorte
);
router.post(
  "/",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(crearCategoriaCorteSchema),
  crearCategoriaCorte
);
router.patch(
  "/:idCategoriaCorte",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idCategoriaCorte")),
  validarSolicitud(actualizarCategoriaCorteSchema),
  actualizarCategoriaCorte
);
router.delete(
  "/:idCategoriaCorte",
  autenticarUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarParametros(uuidParam("idCategoriaCorte")),
  desactivarCategoriaCorte
);

export default router;
