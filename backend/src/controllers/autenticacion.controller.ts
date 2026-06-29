import type { CookieOptions, RequestHandler } from "express";
import { autenticacionService } from "../services/autenticacion.service";
import {
  obtenerCookieSesion,
  obtenerMaxAgeCookie,
  verificarTokenSesion
} from "../utils/jwt";
import type {
  IniciarSesionInput,
  RegistroBarberoInput,
  RegistroClienteInput
} from "../validators/autenticacion.validator";

const esProduccion = () => process.env.NODE_ENV === "production";

const obtenerOpcionesCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: esProduccion(),
  sameSite: esProduccion() ? "none" : "lax",
  path: "/",
  maxAge: obtenerMaxAgeCookie()
});

export const registrarCliente: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await autenticacionService.registrarCliente(
      req.body as RegistroClienteInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Cliente registrado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const registrarBarbero: RequestHandler = async (req, res, next) => {
  try {
    const usuario = await autenticacionService.registrarBarbero(
      req.body as RegistroBarberoInput
    );

    res.status(201).json({
      exito: true,
      mensaje: "Barbero registrado correctamente",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const iniciarSesion: RequestHandler = async (req, res, next) => {
  try {
    const { token, usuario } = await autenticacionService.iniciarSesion(
      req.body as IniciarSesionInput
    );

    res.cookie(obtenerCookieSesion(), token, obtenerOpcionesCookie());

    res.json({
      exito: true,
      mensaje: "Inicio de sesión correcto",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerMiSesion: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[obtenerCookieSesion()];

    if (!token || typeof token !== "string") {
      res.status(401).json({
        exito: false,
        mensaje: "Sesión no encontrada",
        errores: []
      });
      return;
    }

    const payload = verificarTokenSesion(token);
    const usuario = await autenticacionService.obtenerSesionActual(
      payload.idUsuario
    );

    res.json({
      exito: true,
      mensaje: "Sesión activa",
      datos: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

export const cerrarSesion: RequestHandler = (_req, res) => {
  res.clearCookie(obtenerCookieSesion(), {
    httpOnly: true,
    secure: esProduccion(),
    sameSite: esProduccion() ? "none" : "lax",
    path: "/"
  });

  res.json({
    exito: true,
    mensaje: "Sesión cerrada correctamente"
  });
};
