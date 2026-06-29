import { Router } from "express";
import {
  aceptarReserva,
  cancelarAdministracion,
  cancelarBarbero,
  cancelarCliente,
  crearReserva,
  finalizarServicio,
  iniciarServicio,
  listarMisReservasCliente,
  listarMisServiciosBarbero,
  listarReservasAdmin,
  marcarEnCamino,
  obtenerHistorialReserva,
  obtenerReserva,
  rechazarReserva
} from "../controllers/reservas.controller";
import {
  obtenerPagoReserva,
  registrarComprobante
} from "../controllers/pagos.controller";
import { autenticarUsuario } from "../middlewares/autenticar-usuario.middleware";
import { autorizarRoles } from "../middlewares/autorizar-roles.middleware";
import {
  validarConsulta,
  validarParametros,
  validarSolicitud
} from "../middlewares/validar-solicitud.middleware";
import { uuidParam } from "../validators/comun.validator";
import {
  crearReservaSchema,
  filtrosReservasSchema,
  motivoObligatorioSchema,
  motivoOpcionalSchema
} from "../validators/reservas.validator";
import { registrarComprobanteSchema } from "../validators/pagos.validator";

const router = Router();

router.use(autenticarUsuario);

router.post("/", autorizarRoles("CLIENTE"), validarSolicitud(crearReservaSchema), crearReserva);
router.get("/mis-reservas", autorizarRoles("CLIENTE"), validarConsulta(filtrosReservasSchema), listarMisReservasCliente);
router.get("/mis-servicios", autorizarRoles("BARBERO"), validarConsulta(filtrosReservasSchema), listarMisServiciosBarbero);
router.get("/", autorizarRoles("ADMINISTRADOR"), validarConsulta(filtrosReservasSchema), listarReservasAdmin);

router.get("/:idReserva", validarParametros(uuidParam("idReserva")), obtenerReserva);
router.get("/:idReserva/historial", validarParametros(uuidParam("idReserva")), obtenerHistorialReserva);
router.get("/:idReserva/pago", validarParametros(uuidParam("idReserva")), obtenerPagoReserva);
router.post("/:idReserva/pago/comprobante", autorizarRoles("CLIENTE"), validarParametros(uuidParam("idReserva")), validarSolicitud(registrarComprobanteSchema), registrarComprobante);

router.patch("/:idReserva/aceptar", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), aceptarReserva);
router.patch("/:idReserva/rechazar", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), validarSolicitud(motivoObligatorioSchema), rechazarReserva);
router.patch("/:idReserva/en-camino", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), marcarEnCamino);
router.patch("/:idReserva/iniciar-servicio", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), iniciarServicio);
router.patch("/:idReserva/finalizar", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), finalizarServicio);
router.patch("/:idReserva/cancelar-cliente", autorizarRoles("CLIENTE"), validarParametros(uuidParam("idReserva")), validarSolicitud(motivoOpcionalSchema), cancelarCliente);
router.patch("/:idReserva/cancelar-barbero", autorizarRoles("BARBERO"), validarParametros(uuidParam("idReserva")), validarSolicitud(motivoObligatorioSchema), cancelarBarbero);
router.patch("/:idReserva/cancelar-administracion", autorizarRoles("ADMINISTRADOR"), validarParametros(uuidParam("idReserva")), validarSolicitud(motivoObligatorioSchema), cancelarAdministracion);

export default router;
