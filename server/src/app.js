// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "https";
import { Server } from "socket.io";
import fs from "fs";

// Importar rutas
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consentimientoRoutes from "./routes/consentimiento.routes.js";
import testRoutes from "./routes/test.routes.js"
import agendaRoutes from "./routes/agenda.routes.js";
import pacientesRoutes from "./routes/pacientes.routes.js";
import diarioEmocionesRoutes from "./routes/diarioEmociones.routes.js";
import ActividadesRoutes from "./routes/actividades.routes.js";
import chatRoutes from "./routes/chat.routes.js"; // ✅ Tus rutas HTTP
import foroRoutes from "./routes/foro.routes.js";

// Importar controlador de sockets
import { SocketController } from "./controllers/SocketController.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 Cargar certificados SSL (ajusta las rutas según tu configuración)
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/private/midueloapp.key'),
  cert: fs.readFileSync('/etc/ssl/certs/midueloapp.crt'),
};

// 👉 Crear servidor HTTPS
const httpsServer = createServer(sslOptions, app);

// 👉 Configurar Socket.IO
const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 👉 Servir archivos estáticos
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by"); 

// Rutas HTTP (tus rutas existentes)
app.use("/api", authRoutes);
app.use("/api", indexRoutes);
app.use("/api/consentimientos", consentimientoRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/pacientes",pacientesRoutes);
app.use("/api/diario-emociones", diarioEmocionesRoutes);
app.use("/api/actividades", ActividadesRoutes);
app.use("/api/chat", chatRoutes); // ✅ Tus rutas HTTP del chat
app.use("/api/foros", foroRoutes);

// Ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date() });
});

// 👉 Inicializar controlador de sockets
SocketController.initialize(io);

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

const PORT = process.env.PORT || 4001;

httpsServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

export default app;