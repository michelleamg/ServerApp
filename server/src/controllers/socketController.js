import { ChatModel } from "../models/chatModel.js";

export const SocketController = {
  initialize(io) {
    io.on("connection", (socket) => {
      console.log("🔌 Usuario conectado:", socket.id);

      // ────────────────────────────────────────────────
      // 🔹 Inicializar chat (crear u obtener uno)
      // ────────────────────────────────────────────────
      socket.on("init_chat", async (data) => {
        try {
          const { id_paciente } = data;

          if (!id_paciente) {
            socket.emit("chat_error", { error: "ID de paciente requerido" });
            return;
          }

          // 1️⃣ Obtener psicólogo asignado
          const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
          if (!psicologo) {
            socket.emit("chat_error", { error: "No tiene un psicólogo asignado" });
            return;
          }

          // 2️⃣ Crear u obtener chat existente
          const id_chat = await ChatModel.createChat(id_paciente, psicologo.id_psicologo);
          const chatExists = await ChatModel.verifyChatExists(id_chat);
          if (!chatExists) {
            socket.emit("chat_error", { error: "No se pudo crear/obtener el chat" });
            return;
          }

          // 3️⃣ Unirse a la sala correspondiente
          socket.join(`chat_${id_chat}`);
          socket.chatId = id_chat;
          socket.userId = id_paciente;

          // 4️⃣ Emitir datos del chat
          socket.emit("chat_initialized", {
            id_chat,
            psicologo: {
              id: psicologo.id_psicologo,
              nombre: psicologo.nombre,
              apellidoPaterno: psicologo.apellidoPaterno,
              apellidoMaterno: psicologo.apellidoMaterno,
              nombreCompleto: `${psicologo.nombre} ${psicologo.apellidoPaterno} ${psicologo.apellidoMaterno || ""}`.trim(),
            },
          });

          // 5️⃣ Cargar mensajes existentes
          const mensajes = await ChatModel.getByChat(id_chat);
          socket.emit("chat_messages", mensajes);

          console.log(
            `💬 Chat ${id_chat} inicializado (paciente ${id_paciente}) con ${mensajes.length} mensajes`
          );
        } catch (error) {
          console.error("❌ Error en init_chat:", error);
          socket.emit("chat_error", { error: "Error al inicializar el chat" });
        }
      });

      // ────────────────────────────────────────────────
      // 🔹 Obtener mensajes del chat actual
      // ────────────────────────────────────────────────
      socket.on("get_messages", async () => {
        try {
          if (!socket.chatId) {
            socket.emit("messages_error", { error: "Chat no inicializado" });
            return;
          }

          const mensajes = await ChatModel.getByChat(socket.chatId);
          socket.emit("chat_messages", mensajes);
        } catch (error) {
          console.error("❌ Error en get_messages:", error);
          socket.emit("messages_error", { error: "Error al obtener mensajes" });
        }
      });

      // ────────────────────────────────────────────────
      // 🔹 Enviar nuevo mensaje
      // ────────────────────────────────────────────────
      socket.on("send_message", async (data) => {
        try {
          const { remitente, contenido } = data;

          if (!socket.chatId || !remitente || !contenido) {
            socket.emit("message_error", { error: "Chat no inicializado o datos incompletos" });
            return;
          }

          const chatExists = await ChatModel.verifyChatExists(socket.chatId);
          if (!chatExists) {
            socket.emit("message_error", { error: "El chat no existe" });
            return;
          }

          // 1️⃣ Guardar mensaje cifrado
          const nuevoMensaje = await ChatModel.save({
            id_chat: socket.chatId,
            remitente,
            contenido,
          });

          // 2️⃣ Emitir en tiempo real
          io.to(`chat_${socket.chatId}`).emit("new_message", nuevoMensaje);

          // 3️⃣ Confirmar al remitente
          socket.emit("message_sent", { success: true, id: nuevoMensaje.id_mensaje });

          console.log(
            `📤 Mensaje ${nuevoMensaje.id_mensaje} emitido por ${remitente} en chat ${socket.chatId}`
          );
        } catch (error) {
          console.error("❌ Error en send_message:", error);
          socket.emit("message_error", {
            error: "Error al enviar mensaje: " + (error.message || "desconocido"),
          });
        }
      });

      // ────────────────────────────────────────────────
      // 🔹 Desconexión
      // ────────────────────────────────────────────────
      socket.on("disconnect", () => {
        console.log("🔌 Usuario desconectado:", socket.id);
      });
    });
  },
};
