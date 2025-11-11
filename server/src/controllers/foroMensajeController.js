import { ForoMensajeModel } from "../models/foroMensajeModel.js";

export const ForoMensajeController = {
  // 📥 Obtener todos los mensajes del tema
  async getMensajes(req, res) {
    try {
      const { id_tema } = req.params;
      const mensajes = await ForoMensajeModel.getByTema(id_tema);
      return res.json({ success: true, data: mensajes });
    } catch (error) {
      console.error("❌ Error al obtener mensajes foro:", error);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  },

  // 📤 Crear mensaje cifrado y emitirlo en tiempo real
  async crearMensaje(req, res) {
    try {
      const { id_tema } = req.params;
      const { tipo_usuario, id_paciente, id_psicologo, contenido } = req.body;

      if (!contenido) {
        return res.status(400).json({ success: false, message: "Mensaje vacío" });
      }

      const nuevo = await ForoMensajeModel.create({
        id_tema,
        tipo_usuario,
        id_paciente,
        id_psicologo,
        contenido,
      });

      // Emitir evento en tiempo real
      const io = req.app.get("io");
      if (io) io.to(`tema_${id_tema}`).emit("foro:nuevoMensaje", nuevo);

      return res.status(201).json({ success: true, data: nuevo });
    } catch (error) {
      console.error("❌ Error creando mensaje foro:", error);
      res.status(500).json({ success: false, message: "Error al crear mensaje" });
    }
  },
};
