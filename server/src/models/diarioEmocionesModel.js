// models/diarioEmocionesModel.js
import pool from "../db/db.js";

const DiarioEmociones = {};

// 🔹 Guardar una nueva emoción
DiarioEmociones.create = async (id_paciente, emocion, nota, fecha) => {
  const [result] = await pool.query(
    `INSERT INTO diario_emociones (id_paciente, emocion, nota, fecha)
     VALUES (?, ?, ?, ?)`,
    [id_paciente, emocion, nota, fecha]
  );
  return result.insertId;
};

// 🔹 Obtener emociones del mes actual SOLO del paciente indicado
DiarioEmociones.findByPacienteAndMonth = async (id_paciente, year, month) => {
  const [rows] = await pool.query(
    `SELECT id_diario, id_paciente, DATE(fecha) AS fecha, emocion, nota
     FROM diario_emociones
     WHERE id_paciente = ?
       AND YEAR(DATE(fecha)) = ?
       AND MONTH(DATE(fecha)) = ?
     ORDER BY fecha DESC`,
    [id_paciente, year, month]
  );

  // 🔒 Filtro redundante (por seguridad adicional)
  return rows.filter((r) => r.id_paciente == id_paciente);
};

// 🔹 Obtener última emoción del paciente
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
