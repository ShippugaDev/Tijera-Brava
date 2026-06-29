import { Router } from "express";
import {
  actualizarMiFotografia,
  actualizarMiPerfil,
  cambiarEstadoUsuario,
  listarUsuarios,
  obtenerMiPerfil,
  obtenerUsuarioPorId
} from "../controllers/usuarios.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import { subirFotoPerfil } from "../middlewares/subida-foto-perfil.middleware";
import {
  validarConsulta,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import {
  actualizarPerfilGeneralSchema,
  cambiarEstadoUsuarioSchema,
  filtrosUsuariosSchema
} from "../validators/usuarios.validator";

const router = Router();

router.use(autenticarUsuario);

router.get(
  "/mi-perfil",
  autorizarRoles("CLIENTE", "BARBERO", "ADMINISTRADOR"),
  obtenerMiPerfil
);
router.patch(
  "/mi-perfil",
  autorizarRoles("CLIENTE", "BARBERO", "ADMINISTRADOR"),
  validarSolicitud(actualizarPerfilGeneralSchema),
  actualizarMiPerfil
);
router.post(
  "/mi-perfil/fotografia",
  autorizarRoles("CLIENTE", "BARBERO", "ADMINISTRADOR"),
  subirFotoPerfil,
  actualizarMiFotografia
);

router.get(
  "/",
  autorizarRoles("ADMINISTRADOR"),
  validarConsulta(filtrosUsuariosSchema),
  listarUsuarios
);
router.get("/:idUsuario", autorizarRoles("ADMINISTRADOR"), obtenerUsuarioPorId);
router.patch(
  "/:idUsuario/estado",
  autorizarRoles("ADMINISTRADOR"),
  validarSolicitud(cambiarEstadoUsuarioSchema),
  cambiarEstadoUsuario
);

export default router;
