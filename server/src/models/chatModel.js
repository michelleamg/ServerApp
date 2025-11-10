import pool from "../db/db.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carga el .env desde el nivel superior del proyecto (server/.env)
dotenv.config({ path: resolve(__dirname, "../../../.env") });

const AES_KEY = process.env.CHAT_AES_KEY
  ? Buffer.from(process.env.CHAT_AES_KEY, "hex")
  : null;

if (!AES_KEY || AES_KEY.length !== 32) {
  console.error("⚠️ Clave CHAT_AES_KEY inválida. Debe tener 32 bytes (64 hex).");
  process.exit(1);
}

function encryptMessage(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptMessage(data) {
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encryptedText = Buffer.from(encHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", AES_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("❌ Error al descifrar mensaje:", error);
    return "[Mensaje ilegible]";
  }
}

export const ChatModel = {
  async getByChat(id_chat) {
    const [rows] = await pool.query(
      "SELECT id_mensaje, remitente, contenido, fecha_envio, leido FROM mensajes WHERE id_chat = ? ORDER BY fecha_envio ASC",
      [id_chat]
    );
    return rows.map((msg) => ({
      ...msg,
      contenido: decryptMessage(msg.contenido),
    }));
  },

  async save({ id_chat, remitente, contenido }) {
    const contenidoCifrado = encryptMessage(contenido);
    const [res] = await pool.query(
      "INSERT INTO mensaje (id_chat, remitente, contenido) VALUES (?, ?, ?)",
      [id_chat, remitente, contenidoCifrado]
    );
    return res.insertId;
  },

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

  // 🔹 CORREGIDO: Solo para pacientes, obtiene su chat con el psicólogo
  async getPatientChat(id_paciente) {
    const query = `
      SELECT 
        c.id_chat,
        p.id_psicologo,
        p.nombre as psicologo_nombre,
        p.apellidoPaterno as psicologo_apellido_paterno,
        p.apellidoMaterno as psicologo_apellido_materno,
        pa.id_paciente,
        pa.nombre as paciente_nombre,
        pa.apellido_paterno as paciente_apellido_paterno,
        pa.apellido_materno as paciente_apellido_materno
      FROM chat c
      INNER JOIN psicologo p ON c.id_psicologo = p.id_psicologo
      INNER JOIN paciente pa ON c.id_paciente = pa.id_paciente
      WHERE c.id_paciente = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [id_paciente]);
    return rows.length > 0 ? rows[0] : null;
  },

  // 🔹 NUEVO: Crear chat si no existe
  async createChat(id_paciente, id_psicologo) {
    // Verificar si ya existe un chat
    const [existing] = await pool.query(
      "SELECT id_chat FROM chat WHERE id_paciente = ? AND id_psicologo = ?",
      [id_paciente, id_psicologo]
    );

    if (existing.length > 0) {
      return existing[0].id_chat;
    }

    // Crear nuevo chat
    const [res] = await pool.query(
      "INSERT INTO chat (id_paciente, id_psicologo) VALUES (?, ?)",
      [id_paciente, id_psicologo]
    );

    return res.insertId;
  },

  // Función auxiliar para decrypt (hacerla disponible externamente)
  decryptMessage(data) {
    try {
      const [ivHex, tagHex, encHex] = data.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const tag = Buffer.from(tagHex, "hex");
      const encryptedText = Buffer.from(encHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-gcm", AES_KEY, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString("utf8");
    } catch (error) {
      console.error("❌ Error al descifrar mensaje:", error);
      return "[Mensaje ilegible]";
    }
  }
};