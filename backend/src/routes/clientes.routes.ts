import { Router } from "express";
import {
  actualizarMiPerfilCliente,
  obtenerMiPerfilCliente
} from "../controllers/clientes.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import { validarSolicitud } from "../middlewares/validar-solicitud.middleware";
import { actualizarPerfilClienteSchema } from "../validators/clientes.validator";

const router = Router();

router.use(autenticarUsuario);
router.use(autorizarRoles("CLIENTE"));

router.get("/mi-perfil", obtenerMiPerfilCliente);
router.patch(
  "/mi-perfil",
  validarSolicitud(actualizarPerfilClienteSchema),
  actualizarMiPerfilCliente
);

export default router;
