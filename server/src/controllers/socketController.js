import { ChatModel } from "../models/chatModel.js";
import { ForoMensajeModel } from "../models/foroMensajeModel.js";

export const SocketController = {
  initialize(io) {
    io.on('connection', (socket) => {
      console.log('🔌 Usuario conectado:', socket.id);

      socket.on('init_chat', async (data) => {
        try {
          const { id_paciente } = data;
          
          if (!id_paciente) {
            socket.emit('chat_error', { error: 'ID de paciente requerido' });
            return;
          }

          // 1. Obtener psicólogo asignado al paciente
          const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
          
          if (!psicologo) {
            socket.emit('chat_error', { error: 'No tiene un psicólogo asignado' });
            return;
          }

          // 2. Obtener o crear chat EN LA TABLA CHAT
          const id_chat = await ChatModel.createChat(id_paciente, psicologo.id_psicologo);
          
          // 3. Unirse al chat
          socket.join(`chat_${id_chat}`);
          socket.chatId = id_chat;
          socket.userId = id_paciente;

          // 4. Emitir datos del chat al cliente
          socket.emit('chat_initialized', {
            id_chat,
            psicologo: {
              id: psicologo.id_psicologo,
              nombre: psicologo.nombre,
              apellidoPaterno: psicologo.apellidoPaterno,
              apellidoMaterno: psicologo.apellidoMaterno,
              nombreCompleto: `${psicologo.nombre} ${psicologo.apellidoPaterno} ${psicologo.apellidoMaterno || ''}`.trim()
            }
          });

          // 🔥 CRÍTICO: Cargar mensajes existentes automáticamente
          console.log(`📨 Cargando mensajes existentes para chat ${id_chat}`);
          const mensajesExistentes = await ChatModel.getByChat(id_chat);
          socket.emit('chat_messages', mensajesExistentes);

          console.log(`💬 Chat ${id_chat} inicializado para paciente ${id_paciente}. Mensajes cargados: ${mensajesExistentes.length}`);

        } catch (error) {
          console.error('❌ Error en init_chat:', error);
          socket.emit('chat_error', { error: 'Error al inicializar chat' });
        }
      });

      // 🔹 Obtener mensajes del chat (por si se necesita manualmente)
      socket.on('get_messages', async () => {
        try {
          if (!socket.chatId) {
            socket.emit('messages_error', { error: 'Chat no inicializado' });
            return;
          }

          const mensajes = await ChatModel.getByChat(socket.chatId);
          socket.emit('chat_messages', mensajes);

        } catch (error) {
          console.error('❌ Error en get_messages:', error);
          socket.emit('messages_error', { error: 'Error al obtener mensajes' });
        }
      });

      socket.on('send_message', async (data) => {
        try {
          const { contenido } = data;
          
          if (!socket.chatId || !contenido) {
            socket.emit('message_error', { error: 'Chat no inicializado o mensaje vacío' });
            return;
          }

          console.log(`📤 Intentando enviar mensaje al chat ${socket.chatId}:`, contenido);

          // Verificar que el chat existe en la tabla chat
          const chatExists = await ChatModel.verifyChatExists(socket.chatId);
          if (!chatExists) {
            console.error(`❌ Chat ${socket.chatId} no existe en la BD`);
            socket.emit('message_error', { error: 'El chat no existe' });
            return;
          }

          // Guardar mensaje en la base de datos
          const id_mensaje = await ChatModel.save({ 
            id_chat: socket.chatId, 
            remitente: 'paciente', 
            contenido 
          });

          console.log(`✅ Mensaje guardado en BD con ID: ${id_mensaje}`);

          // Obtener el mensaje recién guardado
          const mensajes = await ChatModel.getByChat(socket.chatId);
          const nuevoMensaje = mensajes.find(m => m.id_mensaje === id_mensaje);

          if (nuevoMensaje) {
            if (nuevoMensaje && nuevoMensaje.fecha_envio) {
              const fecha = new Date(nuevoMensaje.fecha_envio);
              nuevoMensaje.fecha_envio = new Intl.DateTimeFormat("es-MX", {
                timeZone: "America/Mexico_City",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(fecha);
            }

            // Emitir a todos en la sala del chat
            io.to(`chat_${socket.chatId}`).emit('new_message', nuevoMensaje);
            
            // Confirmar envío al remitente
            socket.emit('message_sent', { success: true, id: id_mensaje });
            
            console.log(`💬 Mensaje ${id_mensaje} emitido en chat ${socket.chatId}`);
          }

        } catch (error) {
          console.error('❌ Error en send_message:', error);
          socket.emit('message_error', { error: 'Error al enviar mensaje: ' + error.message });
        }
      });
      
//------ FORO MENSAJES EN TIEMPO REAL -----
            // Unirse a un tema del foro
      socket.on("foro:joinTema", ({ id_tema }) => {
        if (!id_tema) return;
        socket.join(`tema_${id_tema}`);
        console.log(`👥 Usuario ${socket.id} unido a sala tema_${id_tema}`);
      });

      // Enviar mensaje al tema
      socket.on("foro:enviarMensaje", async (payload, callback) => {
        try {
          const { id_tema, tipo_usuario, id_paciente, id_psicologo, contenido } = payload;

          if (!id_tema || !contenido) {
            console.warn("⚠️ Datos incompletos al enviar mensaje foro:", payload);
            if (callback) callback({ success: false, message: "Datos incompletos" });
            return;
          }

          // Guardar el mensaje cifrado
          const nuevo = await ForoMensajeModel.create({
            id_tema,
            tipo_usuario,
            id_paciente,
            id_psicologo,
            contenido,
          });

          // Emitirlo a todos los que estén en ese tema
          io.to(`tema_${id_tema}`).emit("foro:nuevoMensaje", nuevo);

          console.log(`💬 Nuevo mensaje foro en tema ${id_tema}:`, nuevo);

          if (callback) callback({ success: true, mensaje: nuevo });
        } catch (error) {
          console.error("❌ Error en foro:enviarMensaje:", error);
          if (callback)
            callback({
              success: false,
              message: "Error al enviar mensaje foro: " + error.message,
            });
        }
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log('🔌 Usuario desconectado:', socket.id);
      });
    });
  }
};