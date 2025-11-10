// app.js - VERSIÓN HTTPS PARA PRODUCCIÓN
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "https"; // ← Cambiar a HTTPS
import { Server } from "socket.io";
import fs from "fs"; // ← Descomentar para producción
import { createServer as createHttpServer } from "http"; // Para redirección HTTP→HTTPS

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
import { SocketController } from "./controllers/socketController.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 CONFIGURACIÓN HTTPS PARA PRODUCCIÓN
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/private/midueloapp.key'),
  cert: fs.readFileSync('/etc/ssl/certs/midueloapp.crt'),
  // Opcional: agregar CA bundle si tienes
  // ca: fs.readFileSync('/etc/ssl/certs/midueloapp.ca-bundle')
};

// 👉 Crear servidor HTTPS principal
const httpsServer = createServer(sslOptions, app);

// 👉 Crear servidor HTTP para redirección (opcional)
const httpServer = createHttpServer((req, res) => {
  res.writeHead(301, { 
    "Location": "https://" + req.headers['host'] + req.url 
  });
  res.end();
});

// 👉 Configurar Socket.IO para HTTPS
const io = new Server(httpsServer, {
  cors: {
    origin: ["https://api-mobile.midueloapp.com", "https://midueloapp.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 👉 Servir archivos estáticos
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// Middlewares
app.use(morgan("combined")); // Cambiar a 'combined' para producción
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 👉 CORS para producción
app.use(cors({
  origin: [
    "https://midueloapp.com",
    "https://www.midueloapp.com",
    "https://api-mobile.midueloapp.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
}));

// Headers de seguridad
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

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

// Ruta de estado/health check
app.get("/api/ping", (req, res) => {
  res.json({ 
    message: "pong", 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Ruta principal
app.get("/", (req, res) => {
  res.json({ 
    message: "API Miduelo - Servidor HTTPS",
    version: "1.0.0",
    status: "active"
  });
});

// 👉 Inicializar controlador de sockets
SocketController.initialize(io);

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;

// 👉 Iniciar servidor HTTPS principal
httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor HTTPS corriendo en puerto ${HTTPS_PORT}`);
  console.log(`   📍 Dominio: https://api-mobile.midueloapp.com`);
  console.log(`   🔒 SSL: Activado`);
});

// 👉 Iniciar redirección HTTP→HTTPS (opcional)
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🔄 Redirección HTTP→HTTPS en puerto ${HTTP_PORT}`);
});

export default app;