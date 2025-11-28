import { ForoMensajeModel } from "../models/foroMensajeModel.js";

export const ForoMensajeController = {
  // 📥 Obtener todos los mensajes del tema
  async getMensajes(req, res) {
    try {
      const { id_tema } = req.params;

      console.log("📩 ForoMensajeController - Obteniendo mensajes del tema:", id_tema);

      // Validación
      if (!id_tema || isNaN(parseInt(id_tema))) {
        console.log("❌ ID de tema inválido:", id_tema);
        return res.status(400).json({ 
          success: false, 
          message: "ID de tema inválido" 
        });
      }

      const mensajes = await ForoMensajeModel.getByTema(parseInt(id_tema));
      
      console.log(`✅ Mensajes obtenidos exitosamente: ${mensajes.length}`);

      return res.json({ 
        success: true, 
        data: mensajes,
        meta: { total: mensajes.length }
      });

    } catch (error) {
      console.error("❌ ERROR en ForoMensajeController.getMensajes:");
      console.error("   Tema:", req.params.id_tema);
      console.error("   Error:", error.message);
      console.error("   Stack:", error.stack);

      res.status(500).json({ 
        success: false, 
        message: "Error interno",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // 📤 Crear mensaje cifrado y emitirlo en tiempo real
  async crearMensaje(req, res) {
    try {
      const { id_tema } = req.params;
      const { tipo_usuario, id_paciente, id_psicologo, contenido } = req.body;

      console.log("📤 ForoMensajeController - Creando mensaje:", {
        id_tema,
        tipo_usuario,
        id_paciente,
        id_psicologo,
        contenidoLength: contenido?.length
      });

      // Validaciones
      if (!id_tema || isNaN(parseInt(id_tema))) {
        return res.status(400).json({ 
          success: false, 
          message: "ID de tema inválido" 
        });
      }

      if (!contenido || contenido.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: "Contenido es requerido" 
        });
      }

      if (!tipo_usuario) {
        return res.status(400).json({ 
          success: false, 
          message: "tipo_usuario es requerido" 
        });
      }

      if (tipo_usuario === 'paciente' && !id_paciente) {
        return res.status(400).json({ 
          success: false, 
          message: "id_paciente es requerido para mensajes de paciente" 
        });
      }

      if (tipo_usuario === 'psicologo' && !id_psicologo) {
        return res.status(400).json({ 
          success: false, 
          message: "id_psicologo es requerido para mensajes de psicólogo" 
        });
      }

      const nuevo = await ForoMensajeModel.create({
        id_tema: parseInt(id_tema),
        tipo_usuario,
        id_paciente: id_paciente ? parseInt(id_paciente) : null,
        id_psicologo: id_psicologo ? parseInt(id_psicologo) : null,
        contenido,
      });

      console.log("✅ Mensaje creado exitosamente:", nuevo.id_mensaje);

      // Emitir evento en tiempo real (si Socket.IO está configurado)
      try {
        const io = req.app.get("io");
        if (io) {
          io.to(`tema_${id_tema}`).emit("foro:nuevoMensaje", nuevo);
          console.log("📡 Evento emitido via Socket.IO");
        }
      } catch (ioError) {
        console.warn("⚠️ No se pudo emitir evento Socket.IO:", ioError.message);
        // No fallar por esto
      }

      return res.status(201).json({ 
        success: true, 
        data: nuevo 
      });

    } catch (error) {
      console.error("❌ ERROR en ForoMensajeController.crearMensaje:");
      console.error("   Tema:", req.params.id_tema);
      console.error("   Body:", req.body);
      console.error("   Error:", error.message);
      console.error("   Stack:", error.stack);

      res.status(500).json({ 
        success: false, 
        message: "Error al crear mensaje",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
};