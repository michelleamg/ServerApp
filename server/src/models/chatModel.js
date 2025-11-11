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
      "SELECT id_mensaje, remitente, contenido, fecha_envio, leido FROM mensaje WHERE id_chat = ? ORDER BY fecha_envio ASC",
      [id_chat]
    );
    
   return rows.map((msg) => ({
    ...msg,
    contenido: decryptMessage(msg.contenido),
    fecha_envio: ChatModel.convertToMexicoTime(msg.fecha_envio)
  }));

  },

  convertToMexicoTime(date) {
    if (!date) return '--:--';
    
    try {
      const fecha = new Date(date);
      
      if (isNaN(fecha.getTime())) {
        console.log('❌ Fecha inválida en backend:', date);
        return '--:--';
      }
      
      const horas = fecha.getHours();
      const minutos = fecha.getMinutes();
      
      if (horas >= 18) {
        console.log('🕒 Detectado mensaje viejo con hora UTC:', fecha.toISOString());
        
        fecha.setHours(fecha.getHours() - 6);
        
        // Formatear la hora corregida
        return fecha.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // Para mensajes nuevos, usar la conversión normal con timezone
      const formatter = new Intl.DateTimeFormat('es-MX', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return formatter.format(fecha);
      
    } catch (error) {
      console.error('❌ Error convirtiendo hora en backend:', error);
      
      // Fallback simple
      try {
        return new Date(date).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch {
        return '--:--';
      }
    }
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

  // 🔹 SIMPLIFICADO: Obtener información del chat del paciente
  async getPatientChat(id_paciente) {
    // Como no hay tabla chat, usamos directamente el id_paciente como id_chat
    // o buscamos mensajes existentes para ese paciente
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

  async createChat(id_paciente, id_psicologo) {
    try {
      // 1. Verificar si ya existe un chat para este paciente-psicólogo
      const [existingChats] = await pool.query(
        "SELECT id_chat FROM chat WHERE id_paciente = ? AND id_psicologo = ?",
        [id_paciente, id_psicologo]
      );

      if (existingChats.length > 0) {
        return existingChats[0].id_chat;
      }

      // 2. Si no existe, crear nuevo chat
      const [result] = await pool.query(
        "INSERT INTO chat (id_paciente, id_psicologo) VALUES (?, ?)",
        [id_paciente, id_psicologo]
      );

      console.log(`✅ Nuevo chat creado: ${result.insertId} para paciente ${id_paciente}`);
      return result.insertId;

    } catch (error) {
      console.error('❌ Error creando chat:', error);
      throw error;
    }
  },

  async verifyChatExists(id_chat) {
    try {
      const [rows] = await pool.query(
        "SELECT id_chat FROM chat WHERE id_chat = ?",
        [id_chat]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('❌ Error verificando chat:', error);
      return false;
    }
  },

  async getExistingChat(id_paciente, id_psicologo) {
    const [rows] = await pool.query(
      "SELECT id_chat FROM chat WHERE id_paciente = ? AND id_psicologo = ?",
      [id_paciente, id_psicologo]
    );
    return rows.length > 0 ? rows[0].id_chat : null;
  },

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