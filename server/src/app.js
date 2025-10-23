// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consentimientoRoutes from "./routes/consentimiento.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import diarioEmocionesRoutes from "./routes/diarioEmociones.routes.js";
import agendaRoutes from "./routes/agenda.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 Servir archivos estáticos
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by"); 

// Rutas
app.use("/api", authRoutes);
app.use("/api", indexRoutes);
app.use("/api/consentimientos", consentimientoRoutes);
app.use("/api/diario-emociones", diarioEmocionesRoutes);
app.use("/api/agenda", agendaRoutes);

// Ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date() });
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

export default app;