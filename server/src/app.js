import express from "express";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http"; // ← Usar HTTP temporalmente
import { Server } from "socket.io";

// Importar rutas
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consentimientoRoutes from "./routes/consentimiento.routes.js";
import testRoutes from "./routes/test.routes.js";
import agendaRoutes from "./routes/agenda.routes.js";
import pacientesRoutes from "./routes/pacientes.routes.js";
import diarioEmocionesRoutes from "./routes/diarioEmociones.routes.js";
import ActividadesRoutes from "./routes/actividades.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import foroRoutes from "./routes/foro.routes.js";
import recursosRoutes from "./routes/recursos.routes.js";
import evidenciasRoutes from "./routes/evidencia.routes.js";
import { SocketController } from "./controllers/socketController.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚙️ Crear servidor HTTP (temporal mientras se reconfigura HTTPS)
const httpServer = createServer(app);

// 🔌 Configurar Socket.IO con CORS y transportes compatibles
export const io = new Server(httpServer, {
  cors: {
    origin: "*", // Puedes restringir luego a tu dominio móvil
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// 🧠 Log de conexiones al servidor WebSocket
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado a Socket.IO:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// 🗂️ Servir archivos estáticos (por ejemplo, PDFs o docs públicos)
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// 🧩 Middlewares globales
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");

// 🚀 Rutas principales
app.use("/api", authRoutes);
app.use("/api", indexRoutes);
app.use("/api/consentimientos", consentimientoRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/diario_emociones", diarioEmocionesRoutes);
app.use("/api/modulos", ActividadesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/foros", foroRoutes);
app.use("/api", recursosRoutes);
app.use("/api", evidenciasRoutes);

// 🔍 Ruta de prueba rápida
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date() });
});

// 🎧 Inicializar el controlador de sockets global (chat, foros, etc.)
SocketController.initialize(io);

// ❌ Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

// 🚀 Levantar servidor
const PORT = process.env.PORT || 4001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP + WebSockets corriendo en puerto ${PORT}`);
  console.log(`📍 Conecta desde: https://api-mobile.midueloapp.com:${PORT}`);
});

// ✅ Exportar app e io para uso en otros controladores
export default app;
