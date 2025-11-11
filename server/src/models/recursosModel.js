// models/recursosModel.js
import pool from "../db/db.js";

export const RecursosModel = {
  async getRecursosPorPaciente(id_paciente) {
    const [rows] = await pool.query(
      `SELECT 
         aa.id_asignacion,
         a.id_actividad,
         a.titulo,
         a.descripcion,
         a.origen,
         a.id_psicologo_creador,
         aa.instrucciones_personalizadas,
         aa.estado,
         aa.fecha_asignacion
       FROM actividad_asignada aa
       INNER JOIN actividad a ON a.id_actividad = aa.id_actividad
       WHERE aa.id_paciente = ?
       ORDER BY aa.fecha_asignacion DESC`,
      [id_paciente]
    );
    return rows;
  },
};
