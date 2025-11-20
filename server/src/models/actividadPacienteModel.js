import pool from "../db/db.js";

export const ActividadPaciente = {

  // Registrar actividad
  registrar: async ({
    id_paciente,
    id_actividad,
    estado = "completada",
    evidencia_texto = null,
    evidencia_foto = null,
    duracion_segundos = null
  }) => {
    const [result] = await pool.query(
      `
        INSERT INTO actividad_paciente
        (
          id_paciente,
          id_actividad,
          estado,
          evidencia_texto,
          evidencia_foto,
          duracion_segundos,
          fecha_realizacion
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        id_paciente,
        id_actividad,
        estado,
        evidencia_texto,
        evidencia_foto,
        duracion_segundos
      ]
    );

    return { id: result.insertId };
  },


  // Obtener TODAS las actividades realizadas por un paciente
  getByPaciente: async (id_paciente) => {
    const [rows] = await pool.query(
      `
      SELECT 
        ap.id_actividad,
        ap.estado,
        ap.evidencia_texto,
        ap.evidencia_foto,
        ap.duracion_segundos,
        ap.fecha_realizacion
      FROM actividad_paciente ap
      WHERE ap.id_paciente = ?
      ORDER BY ap.fecha_realizacion DESC
      `,
      [id_paciente]
    );

    return rows;
  }
};
