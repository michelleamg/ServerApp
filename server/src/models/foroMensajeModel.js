import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js";

export const ForoMensajeModel = {
  async getByTema(id_tema) {
    try {
      console.log("🔍 Consultando tema:", id_tema);

      const [rows] = await pool.query(
        `SELECT 
          mf.id_mensaje_foro, 
          mf.id_tema, 
          mf.tipo_usuario, 
          mf.id_paciente, 
          mf.id_psicologo, 
          mf.contenido, 
          mf.fecha_envio,
          p.nombre AS paciente_nombre, 
          p.apellido_paterno AS paciente_ap, 
          p.apellido_materno AS paciente_am,
          ps.nombre AS psicologo_nombre, 
          ps.apellidoPaterno AS psicologo_ap, 
          ps.apellidoMaterno AS psicologo_am
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_tema = ?
        ORDER BY mf.fecha_envio ASC`,
        [id_tema]
      );

      console.log(`✅ Encontrados ${rows.length} mensajes`);

      return rows.map((msg) => {
        let contenido = msg.contenido || "";
        try {
          if (contenido.includes(":")) contenido = decryptMessage(contenido);
        } catch {}

        let nombre = 'Usuario';
        if (msg.tipo_usuario === 'paciente' && msg.paciente_nombre) {
          const ap = [msg.paciente_ap, msg.paciente_am].filter(Boolean).join(' ');
          nombre = ap ? `${msg.paciente_nombre} ${ap}` : msg.paciente_nombre;
        } else if (msg.tipo_usuario === 'psicologo' && msg.psicologo_nombre) {
          const ap = [msg.psicologo_ap, msg.psicologo_am].filter(Boolean).join(' ');
          nombre = ap ? `${msg.psicologo_nombre} ${ap}` : msg.psicologo_nombre;
        }

        return {
          id_mensaje: msg.id_mensaje_foro,
          id_tema: msg.id_tema,
          id_paciente: msg.id_paciente,
          id_psicologo: msg.id_psicologo,
          tipo_usuario: msg.tipo_usuario || 'paciente',
          contenido,
          fecha_creacion: msg.fecha_envio,
          autor_nombre: nombre,
        };
      });
    } catch (error) {
      console.error("❌ ERROR:", error.message);
      throw error;
    }
  },

  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
    try {
      if (!id_tema || !tipo_usuario || !contenido?.trim()) throw new Error("Faltan parámetros");

      let cifrado = contenido;
      try { cifrado = encryptMessage(contenido); } catch {}

      const [res] = await pool.query(
        `INSERT INTO mensaje_foro (id_tema, tipo_usuario, id_paciente, id_psicologo, contenido, fecha_envio)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_tema, tipo_usuario, tipo_usuario === 'paciente' ? id_paciente : null, tipo_usuario === 'psicologo' ? id_psicologo : null, cifrado]
      );

      const [msg] = await pool.query(
        `SELECT 
          mf.id_mensaje_foro, 
          mf.id_tema, 
          mf.tipo_usuario, 
          mf.id_paciente, 
          mf.id_psicologo, 
          mf.fecha_envio,
          p.nombre AS paciente_nombre, 
          p.apellido_paterno AS paciente_ap, 
          p.apellido_materno AS paciente_am,
          ps.nombre AS psicologo_nombre, 
          ps.apellidoPaterno AS psicologo_ap, 
          ps.apellidoMaterno AS psicologo_am
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_mensaje_foro = ?`,
        [res.insertId]
      );

      const m = msg[0];
      let nombre = 'Usuario';
      if (m.tipo_usuario === 'paciente' && m.paciente_nombre) {
        const ap = [m.paciente_ap, m.paciente_am].filter(Boolean).join(' ');
        nombre = ap ? `${m.paciente_nombre} ${ap}` : m.paciente_nombre;
      } else if (m.tipo_usuario === 'psicologo' && m.psicologo_nombre) {
        const ap = [m.psicologo_ap, m.psicologo_am].filter(Boolean).join(' ');
        nombre = ap ? `${m.psicologo_nombre} ${ap}` : m.psicologo_nombre;
      }

      return {
        id_mensaje: m.id_mensaje_foro,
        id_tema: m.id_tema,
        tipo_usuario: m.tipo_usuario,
        id_paciente: m.id_paciente,
        id_psicologo: m.id_psicologo,
        contenido,
        fecha_creacion: m.fecha_envio,
        autor_nombre: nombre,
      };
    } catch (error) {
      console.error("❌ ERROR:", error.message);
      throw error;
    }
  },
};