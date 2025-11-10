import { ChatModel } from "../models/chatModel.js";
import pool from "../db/db.js";

export const SocketController = {
  initialize(io) {
    io.on('connection', (socket) => {
      console.log('🔌 Paciente conectado:', socket.id);

      // 🔹 Obtener o crear chat para el paciente
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

          // 2. Obtener o crear chat
          const id_chat = await ChatModel.createChat(id_paciente, psicologo.id_psicologo);
          
          // 3. Unirse al chat
          socket.join(`chat_${id_chat}`);
          socket.chatId = id_chat; // Guardar ID del chat en el socket

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

          console.log(`💬 Chat ${id_chat} inicializado para paciente ${id_paciente}`);

        } catch (error) {
          console.error('❌ Error en init_chat:', error);
          socket.emit('chat_error', { error: 'Error al inicializar chat' });
        }
      });

      // 🔹 Obtener mensajes del chat
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

      // 🔹 Enviar mensaje (solo paciente)
      socket.on('send_message', async (data) => {
        try {
          const { contenido } = data;
          
          if (!socket.chatId || !contenido) {
            socket.emit('error', { message: 'Chat no inicializado o mensaje vacío' });
            return;
          }

          // Guardar mensaje en la base de datos (remitente siempre será 'paciente')
          const id_mensaje = await ChatModel.save({ 
            id_chat: socket.chatId, 
            remitente: 'paciente', 
            contenido 
          });

          // Obtener el mensaje completo recién guardado
          const [mensajes] = await pool.query(
            "SELECT id_mensaje, remitente, contenido, fecha_envio, leido FROM mensaje WHERE id_mensaje = ?",
            [id_mensaje]
          );

          if (mensajes.length > 0) {
            const mensaje = {
              ...mensajes[0],
              contenido: ChatModel.decryptMessage(mensajes[0].contenido)
            };

            // Emitir a todos en la sala del chat (paciente y psicólogo web)
            io.to(`chat_${socket.chatId}`).emit('new_message', mensaje);
            
            // Confirmar al remitente
            socket.emit('message_sent', { 
              success: true, 
              id: id_mensaje 
            });
          }

        } catch (error) {
          console.error('❌ Error en send_message:', error);
          socket.emit('error', { message: 'Error al enviar mensaje' });
        }
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log('🔌 Paciente desconectado:', socket.id);
      });
    });
  }
};