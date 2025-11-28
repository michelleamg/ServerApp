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

      console.log("📋 Obteniendo foros para paciente:", id_paciente);

      const [rows] = await pool.query(
        `
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          IF(f.publico = 1, 'Público', 'Privado') AS tipo,
          COALESCE(temas.total_temas, 0) AS total_temas,
          COALESCE(msgs.total_mensajes, 0) AS total_mensajes,
          COALESCE(parts.total_participantes, 0) AS total_participantes,
          'Psicólogo' AS creador,
          IF(fp.id_paciente IS NOT NULL, 1, 0) AS unido
        FROM foro f
        -- 🔹 Subconsulta para contar temas
        LEFT JOIN (
          SELECT id_foro, COUNT(id_tema) AS total_temas
          FROM tema
          GROUP BY id_foro
        ) AS temas ON temas.id_foro = f.id_foro
        -- 🔹 Subconsulta para contar mensajes
        LEFT JOIN (
          SELECT t.id_foro, COUNT(mf.id_mensaje_foro) AS total_mensajes
          FROM tema t
          LEFT JOIN mensaje_foro mf ON t.id_tema = mf.id_tema
          GROUP BY t.id_foro
        ) AS msgs ON msgs.id_foro = f.id_foro
        -- 🔹 Subconsulta para contar participantes
        LEFT JOIN (
          SELECT id_foro, COUNT(id_participante) AS total_participantes
          FROM foro_participante
          GROUP BY id_foro
        ) AS parts ON parts.id_foro = f.id_foro
        -- 🔹 Verificar si el paciente ya se unió
        LEFT JOIN foro_participante fp
          ON fp.id_foro = f.id_foro AND fp.id_paciente = ?
        ORDER BY f.id_foro DESC;
        `,
        [id_paciente]
      );

      console.log(`✅ Encontrados ${rows.length} foros`);

      return res.json({ success: true, data: rows });
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
        ORDER BY t.fecha_creacion DESC;
        `,
        [id_foro]
      );

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

  // 🔹 Obtener detalle de un foro (incluye datos + temas)
  async getForoDetalle(req, res) {
    try {
      const { id_foro } = req.params;
      if (!id_foro) {
        return res.status(400).json({ message: "Falta el parámetro id_foro" });
      }

      // 🟢 Obtener info del foro
      const [foroRows] = await pool.query(
        `
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          IF(f.publico = 1, 'Público', 'Privado') AS tipo,
          COALESCE(parts.total_participantes, 0) AS total_participantes,
          COALESCE(msgs.total_temas, 0) AS total_temas
        FROM foro f
        LEFT JOIN (
          SELECT id_foro, COUNT(id_participante) AS total_participantes
          FROM foro_participante
          GROUP BY id_foro
        ) AS parts ON parts.id_foro = f.id_foro
        LEFT JOIN (
          SELECT id_foro, COUNT(id_tema) AS total_temas
          FROM tema
          GROUP BY id_foro
        ) AS msgs ON msgs.id_foro = f.id_foro
        WHERE f.id_foro = ?
        LIMIT 1;
        `,
        [id_foro]
      );

      if (foroRows.length === 0) {
        return res.status(404).json({ message: "Foro no encontrado" });
      }

      const foro = foroRows[0];

      // 🟢 Obtener los temas de ese foro
      const [temasRows] = await pool.query(
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
        ORDER BY t.fecha_creacion DESC;
        `,
        [id_foro]
      );

      // 🟢 Respuesta unificada
      return res.json({
        success: true,
        foro,
        temas: temasRows,
        meta: { total_temas: temasRows.length },
      });
    } catch (error) {
      console.error("❌ Error en getForoDetalle:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener detalle del foro",
        error: error.message,
      });
    }
  },

  // ✅ CORREGIDO: Verificar si un usuario está unido a un foro
  async checkJoinedForo(req, res) {
    try {
      const { id_foro } = req.params;
      const { id_paciente } = req.query;

      console.log("🔍 Verificando unión:", { id_foro, id_paciente });

      if (!id_paciente) {
        console.log("❌ Falta id_paciente en la petición");
        return res.status(400).json({ 
          message: "Falta id_paciente",
          esta_unido: false 
        });
      }

      // Verificar en la base de datos si el paciente está unido al foro
      const [rows] = await pool.query(
        `SELECT id_participante, fecha_union 
         FROM foro_participante 
         WHERE id_foro = ? AND id_paciente = ?
         LIMIT 1`,
        [id_foro, id_paciente]
      );

      const estaUnido = rows.length > 0;

      console.log(`✅ Resultado: ${estaUnido ? "SÍ está unido" : "NO está unido"}`);
      if (estaUnido) {
        console.log("📅 Fecha de unión:", rows[0].fecha_union);
      }

      return res.status(200).json({ 
        esta_unido: estaUnido,
        participante: estaUnido ? rows[0] : null
      });
    } catch (error) {
      console.error("❌ Error en checkJoinedForo:", error);
      return res.status(500).json({ 
        message: "Error interno del servidor",
        esta_unido: false 
      });
    }
  },

  // ✅ CORREGIDO: Unirse a un foro con validaciones mejoradas
  async unirseForo(req, res) {
    try {
      const { id_foro } = req.params;
      const { id_paciente } = req.body;

      console.log("🔥 Intentando unir al foro:", { id_foro, id_paciente });

      if (!id_foro || !id_paciente) {
        console.log("❌ Faltan parámetros");
        return res.status(400).json({ 
          message: "Faltan parámetros: id_foro o id_paciente" 
        });
      }

      // ✅ Verificar si el foro existe
      const [foroExists] = await pool.query(
        `SELECT id_foro, titulo FROM foro WHERE id_foro = ? LIMIT 1`,
        [id_foro]
      );

      if (foroExists.length === 0) {
        console.log("❌ Foro no encontrado");
        return res.status(404).json({ message: "El foro no existe" });
      }

      // ✅ Verificar si ya está unido
      const [existing] = await pool.query(
        `SELECT id_participante, fecha_union 
         FROM foro_participante 
         WHERE id_foro = ? AND id_paciente = ? 
         LIMIT 1`,
        [id_foro, id_paciente]
      );

      if (existing.length > 0) {
        console.log("⚠️ Usuario ya está unido desde:", existing[0].fecha_union);
        return res.status(200).json({ 
          message: "Ya estás unido a este foro",
          fecha_union: existing[0].fecha_union 
        });
      }

      // ✅ Insertar nuevo participante
      const [result] = await pool.query(
        `INSERT INTO foro_participante (id_foro, id_paciente, tipo_usuario, rol, fecha_union)
         VALUES (?, ?, 'paciente', 'miembro', NOW())`,
        [id_foro, id_paciente]
      );

      console.log("✅ Participante agregado exitosamente, ID:", result.insertId);

      // ✅ Verificar que se insertó correctamente
      const [verification] = await pool.query(
        `SELECT * FROM foro_participante WHERE id_participante = ?`,
        [result.insertId]
      );

      console.log("✅ Verificación post-inserción:", verification[0]);

      return res.status(201).json({ 
        message: "Te has unido al foro exitosamente",
        participante: verification[0]
      });
    } catch (error) {
      console.error("❌ Error al unirse al foro:", error);
      res.status(500).json({
        message: "Error al unirse al foro",
        error: error.message,
      });
    }
  }
};