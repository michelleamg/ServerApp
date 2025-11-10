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
};
