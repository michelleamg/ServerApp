import pool from '../db/db.js';

const DiarioEmociones = {};

// Guardar una nueva emoción
DiarioEmociones.create = async (id_paciente, emocion, nota, fecha) => {
  const [result] = await pool.query(
    `INSERT INTO diario_emociones (id_paciente, emocion, nota, fecha)
     VALUES (?, ?, ?, ?)`,
    [id_paciente, emocion, nota, fecha]
  );
  return result.insertId;
};

// Obtener todas las emociones del mes actual
DiarioEmociones.findByPacienteAndMonth = async (id_paciente, year, month) => {
  const [rows] = await pool.query(
    `SELECT id_diario, fecha, emocion, nota 
     FROM diario_emociones
     WHERE id_paciente = ? 
       AND YEAR(fecha) = ? 
       AND MONTH(fecha) = ?
     ORDER BY fecha DESC`,
    [id_paciente, year, month]
  );
  return rows;
};

// 🔹 (opcional) Obtener última emoción del paciente
DiarioEmociones.findUltima = async (id_paciente) => {
  const sql = `
    SELECT DATE(MAX(fecha)) AS ultima_emocion
    FROM diario_emociones
    WHERE id_paciente = ?
  `;
  const [rows] = await pool.query(sql, [id_paciente]);
  return rows[0]?.ultima_emocion || null;
};
export default DiarioEmociones;
