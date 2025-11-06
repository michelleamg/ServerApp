import pool from "../db/db.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// 🧠 Usa la clave del .env o, si no existe, una por defecto segura
const rawKey = process.env.CHAT_AES_KEY?.trim() || "56e1bdb8c46b2018ca605b51ba57bf3e15fd1385a1bf7747a41cbcdeb07ab6c8";
const AES_KEY = Buffer.from(rawKey, "hex");

// 🔎 Validar longitud exacta (32 bytes)
if (!AES_KEY || AES_KEY.length !== 32) {
  console.error("⚠️ Clave CHAT_AES_KEY inválida o con longitud incorrecta. Debe tener 32 bytes (64 caracteres hex).");
  process.exit(1);
}

// 🔐 Cifrar mensaje
function encryptMessage(text) {
  const iv = crypto.randomBytes(12); // IV de 96 bits
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

// 🔓 Descifrar mensaje
function decryptMessage(data) {
  const [ivHex, tagHex, encHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encryptedText = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", AES_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

// 💬 Modelo principal del chat
export const ChatModel = {
  async save({ id_chat, remitente, contenido }) {
    const contenidoCifrado = encryptMessage(contenido);
    const [res] = await pool.query(
      `INSERT INTO mensajes (id_chat, remitente, contenido) VALUES (?, ?, ?)`,
      [id_chat, remitente, contenidoCifrado]
    );
    return res.insertId;
  },

  async getByChat(id_chat) {
    const [rows] = await pool.query(
      `SELECT id_mensaje, remitente, contenido, fecha_envio, leido 
       FROM mensajes WHERE id_chat = ? ORDER BY fecha_envio ASC`,
      [id_chat]
    );

    return rows.map((msg) => ({
      ...msg,
      contenido: decryptMessage(msg.contenido),
    }));
  },
};
