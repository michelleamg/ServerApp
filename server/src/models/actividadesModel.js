import pool from "../db/db.js";

export const Actividad = {
  getByModulo: async (id_modulo) => {
    const [rows] = await pool.query(
      `
      SELECT 
        id_actividad,
        titulo,
        descripcion,
        tipo,
        origen
      FROM actividad
      WHERE origen = 'modulo'
      AND id_modulo = ?
      ORDER BY id_actividad ASC
      `,
      [id_modulo]
    );

    return rows;
  }
};
