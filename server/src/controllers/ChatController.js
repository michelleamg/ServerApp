import { ChatModel } from "../models/chatModel.js";

export const ChatController = {
  async getMensajes(req, res) {
    try {
      const { id_chat } = req.params;
      const mensajes = await ChatModel.getByChat(id_chat);
      res.json(mensajes);
    } catch (error) {
      console.error("❌ Error al obtener mensajes:", error);
      res.status(500).json({ error: "Error al obtener mensajes" });
    }
  },

  async enviarMensaje(req, res) {
    try {
      const { id_chat, remitente, contenido } = req.body;
      if (!id_chat || !remitente || !contenido) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      const id = await ChatModel.save({ id_chat, remitente, contenido });
      res.json({ success: true, id });
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      res.status(500).json({ error: "Error al enviar mensaje" });
    }
  },

  async getPsychologistByPatient(req, res) {
    try {
      const { id_paciente } = req.params;
      const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
      res.json(psicologo || {});
    } catch (error) {
      console.error("❌ Error al obtener psicólogo:", error);
      res.status(500).json({ error: "Error al obtener psicólogo" });
    }
  },

  // 🆕 NUEVO: Obtener o crear chat para un paciente
  async obtenerChatPorPaciente(req, res) {
    try {
      const { id_paciente } = req.params;
      
      console.log(`📋 Obteniendo chat para paciente ${id_paciente}...`);

      // 1. Obtener psicólogo asignado al paciente
      const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
      
      if (!psicologo) {
        console.warn(`⚠️ Paciente ${id_paciente} no tiene psicólogo asignado`);
        return res.status(404).json({ 
          error: 'No tiene un psicólogo asignado' 
        });
      }

      // 2. Obtener o crear chat
      const id_chat = await ChatModel.createChat(
        id_paciente, 
        psicologo.id_psicologo
      );

      console.log(`✅ Chat ${id_chat} obtenido/creado para paciente ${id_paciente}`);

      res.json({ 
        id_chat,
        psicologo: {
          id: psicologo.id_psicologo,
          nombre: psicologo.nombre,
          apellidoPaterno: psicologo.apellidoPaterno,
          apellidoMaterno: psicologo.apellidoMaterno,
          nombreCompleto: `${psicologo.nombre} ${psicologo.apellidoPaterno} ${psicologo.apellidoMaterno || ''}`.trim()
        }
      });

    } catch (error) {
      console.error("❌ Error al obtener chat:", error);
      res.status(500).json({ 
        error: "Error al obtener chat",
        details: error.message 
      });
    }
  },
};