import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js"; // ✅ usamos el helper

export const ForoMensajeModel = {
  // 📥 Obtener mensajes descifrados de un tema
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
        mf.fecha_creacion,
        COALESCE(p.nombre, ps.nombre) AS autor_nombre
      FROM mensaje_foro mf
      LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
      LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
      WHERE mf.id_tema = ?
      ORDER BY mf.fecha_creacion ASC;
      `,
      [id_tema]
    );

    return rows.map((msg) => ({
      ...msg,
      contenido: decryptMessage(msg.contenido),
    }));
  },

  // 📤 Crear mensaje cifrado
  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
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
      contenido, // descifrado (para enviar al front)
      fecha_creacion: new Date(),
    };
  },
};
