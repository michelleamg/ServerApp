import pool from "../db/db.js";

export const ForoController = {
  async getForosParaPacientes(req, res) {
    try {
      const { id_paciente } = req.query;
      if (!id_paciente) {
        return res.status(400).json({ message: "Falta el parámetro id_paciente" });
      }

      const [rows] = await pool.query(`
        SELECT 
          f.id_foro,
          f.titulo,
          f.descripcion,
          IF(f.publico = 1, 'Público', 'Privado') AS tipo,
          -- 🔹 Contar mensajes a través de los temas
          (
            SELECT COUNT(*) 
            FROM mensaje_foro mf 
            JOIN tema t ON mf.id_tema = t.id_tema
            WHERE t.id_foro = f.id_foro
          ) AS total_mensajes,
          (
            SELECT COUNT(*) 
            FROM foro_participante p 
            WHERE p.id_foro = f.id_foro
          ) AS total_participantes,
          'Psicólogo' AS creador,
          IF(EXISTS(
            SELECT 1 FROM foro_participante fp 
            WHERE fp.id_foro = f.id_foro 
            AND fp.id_paciente = ?
          ), 1, 0) AS unido
        FROM foro f
        WHERE f.publico = 1
           OR f.id_psicologo_creador = (
                SELECT id_psicologo 
                FROM paciente 
                WHERE id_paciente = ?
              )
        ORDER BY f.id_foro DESC
      `, [id_paciente, id_paciente]);

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
};
