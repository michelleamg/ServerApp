import pool from "../db/db.js";

export const ForoController = {
  async getForosParaPacientes(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          f.tipo,
          f.id_psicologo,
          (SELECT COUNT(*) FROM mensaje_foro m WHERE m.id_foro = f.id_foro) AS total_mensajes,
          (SELECT COUNT(*) FROM foro_participante p WHERE p.id_foro = f.id_foro) AS total_participantes,
          'Psicólogo' AS creador,
          0 AS unido
        FROM foro f
        WHERE f.tipo = 'Público'
        ORDER BY f.id_foro DESC
      `);
      return res.json({ foros: rows });
    } catch (error) {
      console.error("Error al obtener foros:", error);
      res.status(500).json({ message: "Error al obtener foros", error: error.message });
    }
  },
};
