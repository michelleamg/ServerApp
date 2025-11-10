// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
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
import { ChatModel } from "./models/chatModel.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Ajusta según tu frontend
    methods: ["GET", "POST"]
  }
});

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
app.use("/api/agenda", agendaRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/pacientes",pacientesRoutes);
app.use("/api/diario-emociones", diarioEmocionesRoutes);
app.use("/api/actividades", ActividadesRoutes);
app.use("/api/chat", chatRoutes); // Puedes mantener algunas rutas si las necesitas
app.use("/api/foros", foroRoutes);

// Ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date() });
});

// 👉 Configuración de Socket.io para el chat
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Unirse a una sala de chat específica
  socket.on("join_chat", (id_chat) => {
    socket.join(`chat_${id_chat}`);
    console.log(`Usuario ${socket.id} se unió al chat ${id_chat}`);
  });

  // Dejar una sala de chat
  socket.on("leave_chat", (id_chat) => {
    socket.leave(`chat_${id_chat}`);
    console.log(`Usuario ${socket.id} dejó el chat ${id_chat}`);
  });

  // Enviar mensaje
  socket.on("send_message", async (data) => {
    try {
      const { id_chat, remitente, contenido } = data;
      
      if (!id_chat || !remitente || !contenido) {
        socket.emit("error", { message: "Faltan campos requeridos" });
        return;
      }

      // Guardar mensaje en la base de datos
      const id_mensaje = await ChatModel.save({ id_chat, remitente, contenido });
      
      // Obtener el mensaje guardado (para tener todos los datos)
      const mensajes = await ChatModel.getByChat(id_chat);
      const mensajeEnviado = mensajes.find(msg => msg.id_mensaje === id_mensaje);

      // Emitir a todos en la sala del chat
      io.to(`chat_${id_chat}`).emit("new_message", mensajeEnviado);
      
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      socket.emit("error", { message: "Error al enviar mensaje" });
    }
  });

  // Cargar historial de mensajes
  socket.on("load_messages", async (id_chat) => {
    try {
      const mensajes = await ChatModel.getByChat(id_chat);
      socket.emit("messages_loaded", mensajes);
    } catch (error) {
      console.error("❌ Error al cargar mensajes:", error);
      socket.emit("error", { message: "Error al cargar mensajes" });
    }
  });

  // Obtener psicólogo del paciente
  socket.on("get_psychologist", async (id_paciente) => {
    try {
      const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
      socket.emit("psychologist_data", psicologo || {});
    } catch (error) {
      console.error("❌ Error al obtener psicólogo:", error);
      socket.emit("error", { message: "Error al obtener psicólogo" });
    }
  });

  // Manejar desconexión
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada: " + req.url });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor con Socket.io corriendo en el puerto ${PORT}`);
});

export default app;