import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js";

export const ForoMensajeModel = {
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
          p.apellido_paterno AS paciente_apellido_paterno,
          p.apellido_materno AS paciente_apellido_materno,
          ps.nombre AS psicologo_nombre,
          ps.apellidoPaterno AS psicologo_apellido_paterno,
          ps.apellidoMaterno AS psicologo_apellido_materno
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_tema = ?
        ORDER BY mf.fecha_envio ASC
        `,
        [id_tema]
      );

      console.log(`✅ Consulta exitosa - Encontrados ${rows.length} mensajes`);

      const mensajesProcesados = rows.map((msg) => {
        let contenidoDescifrado = "[Mensaje ilegible]";
        
        try {
          const texto = msg.contenido || "";
          if (texto && texto.includes(":")) {
            try {
              contenidoDescifrado = decryptMessage(texto);
            } catch (decryptErr) {
              contenidoDescifrado = texto;
            }
          } else {
            contenidoDescifrado = texto || "[Mensaje vacío]";
          }
        } catch (err) {
          contenidoDescifrado = msg.contenido || "[Mensaje ilegible]";
        }

        // Construir nombre completo
        let autorNombre = 'Usuario';
        if (msg.tipo_usuario === 'paciente' && msg.paciente_nombre) {
          const apellidos = [msg.paciente_apellido_paterno, msg.paciente_apellido_materno]
            .filter(Boolean)
            .join(' ');
          autorNombre = apellidos ? `${msg.paciente_nombre} ${apellidos}` : msg.paciente_nombre;
        } else if (msg.tipo_usuario === 'psicologo' && msg.psicologo_nombre) {
          const apellidos = [msg.psicologo_apellido_paterno, msg.psicologo_apellido_materno]
            .filter(Boolean)
            .join(' ');
          autorNombre = apellidos ? `${msg.psicologo_nombre} ${apellidos}` : msg.psicologo_nombre;
        }

        return {
          id_mensaje: msg.id_mensaje_foro,
          id_tema: msg.id_tema,
          id_paciente: msg.id_paciente,
          id_psicologo: msg.id_psicologo,
          tipo_usuario: msg.tipo_usuario || 'paciente',
          contenido: contenidoDescifrado,
          fecha_creacion: msg.fecha_envio,
          autor_nombre: autorNombre,
        };
      });

      console.log(`✅ Mensajes procesados: ${mensajesProcesados.length}`);
      return mensajesProcesados;

    } catch (error) {
      console.error("❌ ERROR en ForoMensajeModel.getByTema:");
      console.error("   Error:", error.message);
      throw error;
    }
  },

  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
    try {
      if (!id_tema || !tipo_usuario || !contenido?.trim()) {
        throw new Error("Faltan parámetros");
      }

      let contenidoCifrado;
      try {
        contenidoCifrado = encryptMessage(contenido);
      } catch {
        contenidoCifrado = contenido;
      }

      const [res] = await pool.query(
        `INSERT INTO mensaje_foro (id_tema, tipo_usuario, id_paciente, id_psicologo, contenido, fecha_envio)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_tema, tipo_usuario, tipo_usuario === 'paciente' ? id_paciente : null, tipo_usuario === 'psicologo' ? id_psicologo : null, contenidoCifrado]
      );

      const [newMessage] = await pool.query(
        `SELECT mf.id_mensaje_foro, mf.id_tema, mf.tipo_usuario, mf.id_paciente, mf.id_psicologo, mf.fecha_envio,
          p.nombre AS paciente_nombre, p.apellido_paterno AS paciente_apellido_paterno, p.apellido_materno AS paciente_apellido_materno,
          ps.nombre AS psicologo_nombre, ps.apellidoPaterno AS psicologo_apellido_paterno, ps.apellidoMaterno AS psicologo_apellido_materno
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_mensaje_foro = ?`,
        [res.insertId]
      );

      const mensaje = newMessage[0];
      let autorNombre = 'Usuario';
      if (mensaje.tipo_usuario === 'paciente' && mensaje.paciente_nombre) {
        const apellidos = [mensaje.paciente_apellido_paterno, mensaje.paciente_apellido_materno].filter(Boolean).join(' ');
        autorNombre = apellidos ? `${mensaje.paciente_nombre} ${apellidos}` : mensaje.paciente_nombre;
      } else if (mensaje.tipo_usuario === 'psicologo' && mensaje.psicologo_nombre) {
        const apellidos = [mensaje.psicologo_apellido_paterno, mensaje.psicologo_apellido_materno].filter(Boolean).join(' ');
        autorNombre = apellidos ? `${mensaje.psicologo_nombre} ${apellidos}` : mensaje.psicologo_nombre;
      }

      return {
        id_mensaje: mensaje.id_mensaje_foro,
        id_tema: mensaje.id_tema,
        tipo_usuario: mensaje.tipo_usuario,
        id_paciente: mensaje.id_paciente,
        id_psicologo: mensaje.id_psicologo,
        contenido: contenido,
        fecha_creacion: mensaje.fecha_envio,
        autor_nombre: autorNombre,
      };

    } catch (error) {
      console.error("❌ ERROR en create:", error.message);
      throw error;
    }
  },
};