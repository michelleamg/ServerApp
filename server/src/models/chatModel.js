import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js"; // ✅ usamos el helper

  function fechaLocalReal() {
    const ahora = new Date();
    return new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      ahora.getHours(),
      ahora.getMinutes(),
      ahora.getSeconds()
    );
  }


export const ChatModel = {
  // 📥 Obtener mensajes descifrados de un chat
  async getByChat(id_chat) {
    const [rows] = await pool.query(
      `SELECT id_mensaje, remitente, contenido, fecha_envio, leido 
       FROM mensaje 
       WHERE id_chat = ? 
       ORDER BY fecha_envio ASC`,
      [id_chat]
    );

    return rows.map((msg) => ({
      ...msg,
      contenido: decryptMessage(msg.contenido),
      fecha_envio: msg.fecha_envio,
    }));
  },

  // 📤 Guardar mensaje cifrado
  async save({ id_chat, remitente, contenido }) {
    const contenidoCifrado = encryptMessage(contenido);
    const fecha_envio = fechaLocalReal(); // 👈 hora real sin UTC

    const [res] = await pool.query(
      "INSERT INTO mensaje (id_chat, remitente, contenido, fecha_envio) VALUES (?, ?, ?, ?)",
      [id_chat, remitente, contenidoCifrado, fecha_envio]
      );

      return res.insertId;
  },

  // 👨‍⚕️ Obtener psicólogo asignado a un paciente
  async getPsychologistByPatient(id_paciente) {
    const [rows] = await pool.query(
      `SELECT p.id_psicologo, p.nombre, p.apellidoPaterno, p.apellidoMaterno
       FROM psicologo p
       INNER JOIN paciente pa ON pa.id_psicologo = p.id_psicologo
       WHERE pa.id_paciente = ?`,
      [id_paciente]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // 🔹 Obtener información del chat del paciente
  async getPatientChat(id_paciente) {
    const [rows] = await pool.query(
      `SELECT DISTINCT m.id_chat,
              p.id_psicologo,
              p.nombre as psicologo_nombre,
              p.apellidoPaterno as psicologo_apellido_paterno,
              p.apellidoMaterno as psicologo_apellido_materno,
              pa.id_paciente,
              pa.nombre as paciente_nombre,
              pa.apellido_paterno as paciente_apellido_paterno,
              pa.apellido_materno as paciente_apellido_materno
       FROM mensaje m
       INNER JOIN psicologo p ON m.id_psicologo = p.id_psicologo
       INNER JOIN paciente pa ON m.id_paciente = pa.id_paciente
       WHERE m.id_paciente = ?
       LIMIT 1`,
      [id_paciente]
    );

    return rows.length > 0 ? rows[0] : null;
  },

  // 🧩 Crear chat si no existe
  async createChat(id_paciente, id_psicologo) {
    try {
      const [existingChats] = await pool.query(
        "SELECT id_chat FROM chat WHERE id_paciente = ? AND id_psicologo = ?",
        [id_paciente, id_psicologo]
      );

      if (existingChats.length > 0) {
        return existingChats[0].id_chat;
      }

      const [result] = await pool.query(
        "INSERT INTO chat (id_paciente, id_psicologo) VALUES (?, ?)",
        [id_paciente, id_psicologo]
      );

      console.log(`✅ Nuevo chat creado: ${result.insertId} para paciente ${id_paciente}`);
      return result.insertId;
    } catch (error) {
      console.error("❌ Error creando chat:", error);
      throw error;
    }
  },

  // 🧩 Verificar si un chat existe
  async verifyChatExists(id_chat) {
    try {
      const [rows] = await pool.query(
        "SELECT id_chat FROM chat WHERE id_chat = ?",
        [id_chat]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("❌ Error verificando chat:", error);
      return false;
    }
  },

  // 🧩 Obtener chat existente entre paciente y psicólogo
  async getExistingChat(id_paciente, id_psicologo) {
    const [rows] = await pool.query(
      "SELECT id_chat FROM chat WHERE id_paciente = ? AND id_psicologo = ?",
      [id_paciente, id_psicologo]
    );
    return rows.length > 0 ? rows[0].id_chat : null;
  },
};
