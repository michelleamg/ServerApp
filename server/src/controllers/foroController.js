// controllers/foroController.js
import pool from "../db/db.js";

export const ForoController = {
  // 🔹 Obtener todos los foros visibles para pacientes
  async getForosParaPacientes(req, res) {
    try {
      const { id_paciente } = req.query;
      if (!id_paciente) {
        return res.status(400).json({ message: "Falta el parámetro id_paciente" });
      }

      const [rows] = await pool.query(
        `
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          IF(f.publico = 1, 'Público', 'Privado') AS tipo,
          COALESCE(msgs.total_mensajes, 0) AS total_mensajes,
          COALESCE(parts.total_participantes, 0) AS total_participantes,
          'Psicólogo' AS creador,
          IF(fp.id_paciente IS NOT NULL, 1, 0) AS unido
        FROM foro f
        LEFT JOIN (
          SELECT t.id_foro, COUNT(mf.id_mensaje_foro) AS total_mensajes
          FROM tema t
          LEFT JOIN mensaje_foro mf ON t.id_tema = mf.id_tema
          GROUP BY t.id_foro
        ) AS msgs ON msgs.id_foro = f.id_foro
        LEFT JOIN (
          SELECT id_foro, COUNT(id_participante) AS total_participantes
          FROM foro_participante
          GROUP BY id_foro
        ) AS parts ON parts.id_foro = f.id_foro
        LEFT JOIN foro_participante fp
          ON fp.id_foro = f.id_foro AND fp.id_paciente = ?
        WHERE f.publico = 1
           OR f.id_psicologo_creador = (
                SELECT id_psicologo FROM paciente WHERE id_paciente = ?
             )
        ORDER BY f.id_foro DESC;
        `,
        [id_paciente, id_paciente]
      );

      return res.json({ success: true, foros: rows });
    } catch (error) {
      console.error("❌ Error al obtener foros:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener foros",
        error: error.message,
      });
    }
  },

  // 🔹 Obtener todos los foros (modo general o admin)
  async getForos(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          IF(f.publico = 1, 'Público', 'Privado') AS tipo,
          f.creado_en
        FROM foro f
        ORDER BY f.id_foro DESC
      `);
      return res.json({ success: true, foros: rows });
    } catch (error) {
      console.error("❌ Error en getForos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener todos los foros",
        error: error.message,
      });
    }
  },

  // 🔹 Obtener temas de un foro específico
  // 🔹 Obtener temas de un foro específico
  // 🔹 Obtener temas de un foro específico (formato igual a la web)
  async getTemas(req, res) {
    try {
      const { id_foro } = req.params;
      if (!id_foro) {
        return res.status(400).json({ message: "Falta el parámetro id_foro" });
      }

      const [rows] = await pool.query(
        `
        SELECT 
          t.id_tema,
          t.titulo,
          t.descripcion,
          DATE_FORMAT(t.fecha_creacion, '%Y-%m-%d') AS fecha,
          COALESCE(msgs.total_mensajes, 0) AS total_mensajes
        FROM tema t
        LEFT JOIN (
          SELECT id_tema, COUNT(id_mensaje_foro) AS total_mensajes
          FROM mensaje_foro
          GROUP BY id_tema
        ) AS msgs ON msgs.id_tema = t.id_tema
        WHERE t.id_foro = ?
        ORDER BY t.creado_en DESC;
        `,
        [id_foro]
      );

      // Formato de respuesta igual que el backend web
      return res.json({
        success: true,
        data: rows,
        meta: { total: rows.length },
      });
    } catch (error) {
      console.error("❌ Error al obtener temas:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener temas",
        error: error.message,
      });
    }
  },

};
