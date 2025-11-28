import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js";

export const ForoMensajeModel = {
  // 📥 Obtener mensajes (descifra si aplica, tolera mensajes antiguos)
  async getByTema(id_tema) {
    try {
      console.log("🔍 ForoMensajeModel - Consultando mensajes del tema:", id_tema);

      const [rows] = await pool.query(
        `
        SELECT 
          mf.id_mensaje_foro,
          mf.id_tema,
          mf.tipo_usuario,
          mf.id_paciente,
          mf.id_psicologo,
          mf.contenido,
          mf.fecha_envio,
          p.nombre AS paciente_nombre,
          p.apellido AS paciente_apellido,
          ps.nombre AS psicologo_nombre,
          ps.apellido AS psicologo_apellido
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_tema = ?
        ORDER BY mf.fecha_envio ASC
        `,
        [id_tema]
      );

      console.log(`✅ Consulta exitosa - Encontrados ${rows.length} mensajes`);

      // ✅ Procesar y descifrar
      const mensajesProcesados = rows.map((msg) => {
        let contenidoDescifrado = "[Mensaje ilegible]";
        
        try {
          const texto = msg.contenido || "";
          
          // Intentar descifrar si tiene formato cifrado
          if (texto && texto.includes(":")) {
            try {
              contenidoDescifrado = decryptMessage(texto);
              console.log(`✅ Mensaje ${msg.id_mensaje_foro} descifrado correctamente`);
            } catch (decryptErr) {
              console.warn(`⚠️ No se pudo descifrar mensaje ${msg.id_mensaje_foro}, usando texto original`);
              contenidoDescifrado = texto;
            }
          } else {
            // Mensaje sin cifrar (antiguo o texto plano)
            contenidoDescifrado = texto || "[Mensaje vacío]";
          }
        } catch (err) {
          console.error(`❌ Error procesando mensaje ${msg.id_mensaje_foro}:`, err.message);
          contenidoDescifrado = msg.contenido || "[Mensaje ilegible]";
        }

        // Determinar nombre del autor
        let autorNombre = 'Usuario';
        if (msg.tipo_usuario === 'paciente' && msg.paciente_nombre) {
          autorNombre = `${msg.paciente_nombre} ${msg.paciente_apellido || ''}`.trim();
        } else if (msg.tipo_usuario === 'psicologo' && msg.psicologo_nombre) {
          autorNombre = `${msg.psicologo_nombre} ${msg.psicologo_apellido || ''}`.trim();
        }

        // ✅ Formato compatible con el frontend
        return {
          id_mensaje: msg.id_mensaje_foro,
          id_tema: msg.id_tema,
          id_paciente: msg.id_paciente,
          id_psicologo: msg.id_psicologo,
          tipo_usuario: msg.tipo_usuario || 'paciente',
          contenido: contenidoDescifrado,
          fecha_creacion: msg.fecha_envio, // Alias para compatibilidad
          autor_nombre: autorNombre,
        };
      });

      console.log(`✅ Mensajes procesados exitosamente: ${mensajesProcesados.length}`);
      return mensajesProcesados;

    } catch (error) {
      console.error("❌ ERROR CRÍTICO en ForoMensajeModel.getByTema:");
      console.error("   Tema ID:", id_tema);
      console.error("   Error:", error.message);
      console.error("   Stack:", error.stack);
      throw error;
    }
  },

  // 📤 Crear mensaje cifrado
  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
    try {
      console.log("📤 ForoMensajeModel - Creando mensaje:", { 
        id_tema, 
        tipo_usuario, 
        id_paciente, 
        id_psicologo,
        contenidoLength: contenido?.length 
      });

      // Validaciones
      if (!id_tema) {
        throw new Error("id_tema es requerido");
      }
      if (!tipo_usuario) {
        throw new Error("tipo_usuario es requerido");
      }
      if (!contenido || contenido.trim() === '') {
        throw new Error("contenido es requerido");
      }

      // Validar que tenga el ID correspondiente
      if (tipo_usuario === 'paciente' && !id_paciente) {
        throw new Error("id_paciente es requerido para mensajes de paciente");
      }
      if (tipo_usuario === 'psicologo' && !id_psicologo) {
        throw new Error("id_psicologo es requerido para mensajes de psicólogo");
      }

      // Cifrar antes de guardar
      let contenidoCifrado;
      try {
        contenidoCifrado = encryptMessage(contenido);
        console.log("✅ Mensaje cifrado correctamente");
      } catch (encryptErr) {
        console.error("❌ Error al cifrar, guardando texto plano:", encryptErr.message);
        contenidoCifrado = contenido; // Fallback a texto plano
      }

      // Insertar
      const [res] = await pool.query(
        `
        INSERT INTO mensaje_foro 
          (id_tema, tipo_usuario, id_paciente, id_psicologo, contenido, fecha_envio)
        VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [
          id_tema,
          tipo_usuario,
          tipo_usuario === 'paciente' ? id_paciente : null,
          tipo_usuario === 'psicologo' ? id_psicologo : null,
          contenidoCifrado
        ]
      );

      console.log("✅ Mensaje insertado con ID:", res.insertId);

      // Obtener el mensaje completo
      const [newMessage] = await pool.query(
        `
        SELECT 
          mf.id_mensaje_foro,
          mf.id_tema,
          mf.tipo_usuario,
          mf.id_paciente,
          mf.id_psicologo,
          mf.fecha_envio,
          p.nombre AS paciente_nombre,
          p.apellido AS paciente_apellido,
          ps.nombre AS psicologo_nombre,
          ps.apellido AS psicologo_apellido
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_mensaje_foro = ?
        `,
        [res.insertId]
      );

      if (!newMessage || newMessage.length === 0) {
        throw new Error("No se pudo recuperar el mensaje creado");
      }

      const mensaje = newMessage[0];

      // Determinar nombre del autor
      let autorNombre = 'Usuario';
      if (mensaje.tipo_usuario === 'paciente' && mensaje.paciente_nombre) {
        autorNombre = `${mensaje.paciente_nombre} ${mensaje.paciente_apellido || ''}`.trim();
      } else if (mensaje.tipo_usuario === 'psicologo' && mensaje.psicologo_nombre) {
        autorNombre = `${mensaje.psicologo_nombre} ${mensaje.psicologo_apellido || ''}`.trim();
      }

      // ✅ Retornar en formato compatible con frontend
      const resultado = {
        id_mensaje: mensaje.id_mensaje_foro,
        id_tema: mensaje.id_tema,
        tipo_usuario: mensaje.tipo_usuario,
        id_paciente: mensaje.id_paciente,
        id_psicologo: mensaje.id_psicologo,
        contenido: contenido, // Texto plano para el frontend
        fecha_creacion: mensaje.fecha_envio,
        autor_nombre: autorNombre,
      };

      console.log("✅ Mensaje creado exitosamente:", resultado.id_mensaje);
      return resultado;

    } catch (error) {
      console.error("❌ ERROR CRÍTICO en ForoMensajeModel.create:");
      console.error("   Parámetros:", { id_tema, tipo_usuario, id_paciente, id_psicologo });
      console.error("   Error:", error.message);
      console.error("   Stack:", error.stack);
      throw error;
    }
  },
};