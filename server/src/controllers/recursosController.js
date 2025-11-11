import pool from "../db/db.js";

export const RecursosController = {
  // Obtener todos los recursos personalizados
  async getRecursos(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT id_actividad, titulo, descripcion, archivo_url, origen, id_psicologo_creador
         FROM actividad
         WHERE origen = 'personalizada'
         ORDER BY id_actividad DESC`
      );

      res.json({ success: true, recursos: rows });
    } catch (error) {
      console.error("❌ Error al obtener recursos:", error);
      res.status(500).json({ success: false, error: "Error al obtener recursos" });
    }
  },
};
