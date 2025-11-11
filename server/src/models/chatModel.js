// src/models/chatModel.js
import pool from "../db/db.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env desde server/.env (sube: models -> src -> server)
dotenv.config({ path: resolve(__dirname, "../../../.env") });

const keyHex = process.env.CHAT_AES_KEY;
if (!keyHex || keyHex.length !== 64) {
  console.error("⚠️ CHAT_AES_KEY inválida. Debe ser 64 caracteres hex (32 bytes).");
  process.exit(1);
}
const AES_KEY = Buffer.from(keyHex, "hex");

function encryptMessage(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptMessageOrPlaceholder(data) {
  try {
    if (!data) return "";
    const [ivHex, tagHex, encHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encryptedText = Buffer.from(encHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", AES_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("❌ Error al descifrar mensaje:", error);
    return "[Mensaje ilegible]";
  }
}

function toMexicoTime(date) {
  if (!date) return "--:--";
  try {
    // 🔹 Si date ya es objeto Date, úsalo; si viene como string, añade 'Z' para forzar UTC
    const utcDate =
      date instanceof Date ? date : new Date(`${date}Z`);

    if (isNaN(utcDate.getTime())) {
      console.log("❌ Fecha inválida en backend:", date);
      return "--:--";
    }

    // 🔹 Convertir correctamente de UTC → CDMX
    return utcDate.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("❌ Error convirtiendo hora:", error);
    return "--:--";
  }
}

export const ChatModel = {
  async getByChat(id_chat) {
    const [rows] = await pool.query(
      `SELECT id_mensaje, remitente, contenido, fecha_envio, leido
       FROM mensaje
       WHERE id_chat = ?
       ORDER BY fecha_envio ASC`,
      [id_chat]
    );

    return rows.map((msg) => ({
      id_mensaje: msg.id_mensaje,
      remitente: msg.remitente,
      contenido: decryptMessageOrPlaceholder(msg.contenido),
      fecha_envio: toMexicoTime(msg.fecha_envio),
      leido: msg.leido,
    }));
  },

  async save({ id_chat, remitente, contenido }) {
    const contenidoCifrado = encryptMessage(contenido);
    const [res] = await pool.query(
      `INSERT INTO mensaje (id_chat, remitente, contenido)
       VALUES (?, ?, ?)`,
      [id_chat, remitente, contenidoCifrado]
    );
    return res.insertId;
  },

  async getPsychologistByPatient(id_paciente) {
    const [rows] = await pool.query(
      `SELECT p.id_psicologo,
              p.nombre,
              p.apellidoPaterno,
              p.apellidoMaterno
       FROM paciente pa
       JOIN psicologo p ON pa.id_psicologo = p.id_psicologo
       WHERE pa.id_paciente = ?
       LIMIT 1`,
      [id_paciente]
    );
    return rows[0] || null;
  },

  async getExistingChat(id_paciente, id_psicologo) {
    const [rows] = await pool.query(
      `SELECT id_chat
       FROM chat
       WHERE id_paciente = ? AND id_psicologo = ?
       LIMIT 1`,
      [id_paciente, id_psicologo]
    );
    return rows[0]?.id_chat || null;
  },

  async createChat(id_paciente, id_psicologo) {
    const existing = await this.getExistingChat(id_paciente, id_psicologo);
    if (existing) return existing;

    const [res] = await pool.query(
      `INSERT INTO chat (id_paciente, id_psicologo)
       VALUES (?, ?)`,
      [id_paciente, id_psicologo]
    );

    console.log(`✅ Nuevo chat creado ${res.insertId} para paciente ${id_paciente}`);
    return res.insertId;
  },

  async verifyChatExists(id_chat) {
    const [rows] = await pool.query(
      `SELECT id_chat FROM chat WHERE id_chat = ? LIMIT 1`,
      [id_chat]
    );
    return rows.length > 0;
  },
};
