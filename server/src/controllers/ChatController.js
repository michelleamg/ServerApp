// src/controllers/ChatController.js
import { ChatModel } from "../models/chatModel.js";

export const ChatController = {
  async getMensajes(req, res) {
    try {
      const { id_chat } = req.params;
      if (!id_chat) {
        return res.status(400).json({ error: "id_chat es requerido" });
      }

      const exists = await ChatModel.verifyChatExists(id_chat);
      if (!exists) {
        return res.status(404).json({ error: "Chat no encontrado" });
      }

      const mensajes = await ChatModel.getByChat(id_chat);
      return res.json({ success: true, mensajes });
    } catch (error) {
      console.error("❌ Error al obtener mensajes:", error);
      return res.status(500).json({ error: "Error al obtener mensajes" });
    }
  },

  async enviarMensaje(req, res) {
    try {
      const { id_chat, remitente, contenido } = req.body;

      if (!id_chat || !remitente || !contenido) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      const exists = await ChatModel.verifyChatExists(id_chat);
      if (!exists) {
        return res.status(404).json({ error: "Chat no encontrado" });
      }

      const id = await ChatModel.save({ id_chat, remitente, contenido });

      return res.json({ success: true, id });
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      return res.status(500).json({ error: "Error al enviar mensaje" });
    }
  },

  async getPsychologistByPatient(req, res) {
    try {
      const { id_paciente } = req.params;
      if (!id_paciente) {
        return res.status(400).json({ error: "id_paciente es requerido" });
      }

      const psicologo = await ChatModel.getPsychologistByPatient(id_paciente);
      if (!psicologo) {
        return res.status(404).json({ error: "No se encontró psicólogo asignado" });
      }

      const id_chat = await ChatModel.createChat(id_paciente, psicologo.id_psicologo);

      return res.json({
        success: true,
        psicologo,
        id_chat,
      });
    } catch (error) {
      console.error("❌ Error al obtener psicólogo:", error);
      return res.status(500).json({ error: "Error al obtener psicólogo" });
    }
  },
};
