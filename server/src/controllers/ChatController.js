import { ChatModel } from "../models/chatModel.js";

export const ChatController = {
  async getMensajes(req, res) {
    try {
      const { id_chat } = req.params;
      const mensajes = await ChatModel.getByChat(id_chat);
      res.status(200).json({ mensajes });
    } catch (error) {
      console.error("❌ Error al obtener mensajes:", error);
      res.status(500).json({ message: "Error al obtener mensajes" });
    }
  },

  async enviarMensaje(req, res) {
    try {
      const { id_chat, remitente, contenido } = req.body;
      const id = await ChatModel.save({ id_chat, remitente, contenido });
      res.status(201).json({ message: "Mensaje enviado", id });
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      res.status(500).json({ message: "Error al enviar mensaje" });
    }
  },
};
