// @ts-nocheck
import pool from "../db/db.js";                // ✅ Ruta correcta dentro del backend
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env (igual que en chatModel.js)
dotenv.config({ path: resolve(__dirname, "../../../.env") });

// 🔐 Cargar clave AES
const AES_KEY = process.env.CHAT_AES_KEY
  ? Buffer.from(process.env.CHAT_AES_KEY, "hex")
  : null;

if (!AES_KEY || AES_KEY.length !== 32) {
  console.error("⚠️ Clave CHAT_AES_KEY inválida. Debe tener 32 bytes (64 hex).");
  process.exit(1);
}

/**
 * 🔒 Cifra un mensaje de texto con AES-256-GCM
 * @param {string} text
 * @returns {string} Formato iv:tag:ciphertext
 */
function encryptMessage(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * 🔓 Descifra un mensaje cifrado (iv:tag:ciphertext)
 * @param {string} data
 * @returns {string}
 */
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
    console.error("❌ Error al descifrar mensaje foro:", error);
    return "[Mensaje ilegible]";
  }
}

export const ForoMensajeModel = {
  /**
   * 📥 Obtener todos los mensajes descifrados de un tema
   * @param {number} id_tema
   * @returns {Promise<any[]>}
   */
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

  /**
   * 📤 Crea un nuevo mensaje cifrado dentro del tema
   */
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
      contenido, // texto plano (para enviar al frontend)
      fecha_creacion: new Date(),
    };
  },
};
