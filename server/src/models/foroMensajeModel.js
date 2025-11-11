import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js";

export const ForoMensajeModel = {
  // 📥 Obtener mensajes (descifra si aplica, tolera mensajes antiguos)
  async getByTema(id_tema) {
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
        COALESCE(p.nombre, ps.nombre) AS autor_nombre
      FROM mensaje_foro mf
      LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
      LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
      WHERE mf.id_tema = ?
      ORDER BY mf.fecha_envio ASC;
      `,
      [id_tema]
    );

    // ✅ Procesar y descifrar
    return rows.map((msg) => {
      let contenidoDescifrado = "[Mensaje ilegible]";

      try {
        // Si tiene formato de cifrado (iv:tag:cipher)
        if (msg.contenido && msg.contenido.includes(":")) {
          contenidoDescifrado = decryptMessage(msg.contenido);
        } else {
          // Mensaje plano (antiguo)
          contenidoDescifrado = msg.contenido || "[Mensaje vacío]";
        }
      } catch (err) {
        console.error("⚠️ Error al descifrar mensaje:", err.message);
        contenidoDescifrado = msg.contenido || "[Mensaje ilegible]";
      }

      return {
        ...msg,
        contenido: contenidoDescifrado,
      };
    });
  },

  // 📤 Crear mensaje cifrado
  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
    try {
      // Cifrar antes de guardar
      const contenidoCifrado = encryptMessage(contenido);

      const [res] = await pool.query(
        `
        INSERT INTO mensaje_foro 
          (id_tema, tipo_usuario, id_paciente, id_psicologo, contenido)
        VALUES (?, ?, ?, ?, ?)
        `,
        [id_tema, tipo_usuario, id_paciente, id_psicologo, contenidoCifrado]
      );

      return {
        id_mensaje_foro: res.insertId,
        id_tema,
        tipo_usuario,
        id_paciente,
        id_psicologo,
        contenido, // texto plano para mostrar al frontend
        fecha_envio: new Date(),
      };
    } catch (error) {
      console.error("❌ Error creando mensaje cifrado:", error);
      throw error;
    }
  },
};
