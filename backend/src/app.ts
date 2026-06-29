import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { errorHandler } from "./middlewares/error-handler";
import administracionRoutes from "./routes/administracion.routes";
import autenticacionRoutes from "./routes/autenticacion.routes";
import barberosRoutes from "./routes/barberos.routes";
import calificacionesRoutes from "./routes/calificaciones.routes";
import categoriasCortesRoutes from "./routes/categorias-cortes.routes";
import clientesRoutes from "./routes/clientes.routes";
import disponibilidadRoutes from "./routes/disponibilidad.routes";
import especialidadesRoutes from "./routes/especialidades.routes";
import lookiaRoutes from "./routes/lookia.routes";
import notificacionesRoutes from "./routes/notificaciones.routes";
import saludRoutes from "./routes/salud.routes";
import serviciosRoutes from "./routes/servicios.routes";
import reservasRoutes from "./routes/reservas.routes";
import pagosRoutes from "./routes/pagos.routes";
import portafoliosRoutes from "./routes/portafolios.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import zonasCoberturaRoutes from "./routes/zonas-cobertura.routes";

const app = express();
const origenesPermitidos = new Set(
  [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"]
    .filter((origen): origen is string => Boolean(origen))
    .map((origen) => origen.replace(/\/+$/, ""))
);

const esPreviewVercel = (origin: string) => {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      !url.port &&
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (origenesPermitidos.has(origin) || esPreviewVercel(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/salud", saludRoutes);
app.use("/api/administracion", administracionRoutes);
app.use("/api/autenticacion", autenticacionRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/categorias-cortes", categoriasCortesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/barberos", barberosRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/lookia", lookiaRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/portafolios", portafoliosRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/zonas-cobertura", zonasCoberturaRoutes);

app.use(errorHandler);

export default app;
