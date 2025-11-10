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
import chatRoutes from "./routes/chat.routes.js";
import foroRoutes from "./routes/foro.routes.js";
import { SocketController } from "./controllers/SocketController.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 VERIFICAR SI LOS CERTIFICADOS EXISTEN
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync('/etc/ssl/private/midueloapp.key'),
    cert: fs.readFileSync('/etc/ssl/certs/midueloapp.crt'),
  };
  console.log('✅ Certificados SSL cargados correctamente');
} catch (error) {
  console.error('❌ Error cargando certificados SSL:', error.message);
  console.log('🔄 Usando HTTP en lugar de HTTPS');
  // Fallback a HTTP si no hay certificados
  sslOptions = null;
}

// 👉 Crear servidor (HTTPS si hay certificados, HTTP si no)
const server = sslOptions 
  ? createServer(sslOptions, app)
  : createServer(app);

// 👉 Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // En producción ajusta esto
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 👉 Servir archivos estáticos
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// Middlewares
app.use(morgan("combined"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: "*", // Ajustar en producción
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// Headers de seguridad
app.disable("x-powered-by");

// Rutas HTTP
app.use("/api", authRoutes);
app.use("/api", indexRoutes);
app.use("/api/consentimientos", consentimientoRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/diario-emociones", diarioEmocionesRoutes);
app.use("/api/actividades", ActividadesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/foros", foroRoutes);

// Ruta de estado
app.get("/api/ping", (req, res) => {
  res.json({ 
    message: "pong", 
    timestamp: new Date(),
    https: !!sslOptions
  });
});

// 👉 Inicializar controlador de sockets
SocketController.initialize(io);

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

// 👉 USAR PUERTO 4001 EN LUGAR DE 443
const PORT = process.env.PORT || 4001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ${sslOptions ? 'HTTPS' : 'HTTP'} corriendo en puerto ${PORT}`);
  console.log(`📍 URL: ${sslOptions ? 'https' : 'http'}://api-mobile.midueloapp.com:${PORT}`);
});

export default app;