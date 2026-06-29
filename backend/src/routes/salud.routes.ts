import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    exito: true,
    mensaje: "API de Tijera Brava funcionando correctamente"
  });
});

export default router;
