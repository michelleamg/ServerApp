import pool from "../db/db.js";

/**
 * 🔹 Obtiene todas las actividades (de tipo 'modulo')
 * junto con el estado del paciente.
 */
export const obtenerActividadesPorPaciente = async (id_paciente) => {
  const [rows] = await pool.query(
    `
    SELECT 
      a.id_actividad,
      a.titulo,
      a.descripcion,
      a.tipo,
      a.origen,
      ap.estado,
      ap.evidencia_texto,
      ap.evidencia_foto,
      ap.duracion_segundos
    FROM actividad a
    LEFT JOIN actividad_paciente ap
      ON a.id_actividad = ap.id_actividad 
      AND ap.id_paciente = ?
    WHERE a.origen = 'modulo'
    ORDER BY a.id_actividad ASC
    `,
    [id_paciente]
  );
  return rows;
};

/**
 * 🔹 Inserta un nuevo registro o actualiza uno existente.
 */
export const registrarOActualizarActividadPaciente = async (data) => {
  const {
    id_paciente,
    id_actividad,
    estado,
    evidencia_texto,
    evidencia_foto,
    duracion_segundos,
  } = data;

  const [existe] = await pool.query(
    "SELECT id_actividad_paciente FROM actividad_paciente WHERE id_paciente = ? AND id_actividad = ?",
    [id_paciente, id_actividad]
  );

  if (existe.length > 0) {
    await pool.query(
      `
      UPDATE actividad_paciente
      SET estado = ?, evidencia_texto = ?, evidencia_foto = ?, duracion_segundos = ?, fecha_realizacion = NOW()
      WHERE id_paciente = ? AND id_actividad = ?
      `,
      [
        estado || "pendiente",
        evidencia_texto || null,
        evidencia_foto || null,
        duracion_segundos || null,
        id_paciente,
        id_actividad,
      ]
    );
  } else {
    await pool.query(
      `
      INSERT INTO actividad_paciente
      (id_paciente, id_actividad, estado, evidencia_texto, evidencia_foto, duracion_segundos)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id_paciente,
        id_actividad,
        estado || "pendiente",
        evidencia_texto || null,
        evidencia_foto || null,
        duracion_segundos || null,
      ]
    );
  }

  return { message: "Registro exitoso " };
};
