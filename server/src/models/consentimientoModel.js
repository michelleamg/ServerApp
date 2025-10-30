// models/consentimientoModel.js
import pool from '../db/db.js';

const Consentimiento = {};

// Crear o actualizar consentimientos
Consentimiento.saveOrUpdate = async (id_paciente, aviso_privacidad, terminos_condiciones) => {
  // Verificar si ya existe
  const [existing] = await pool.query(
    "SELECT id_consentimiento FROM consentimientos WHERE id_paciente = ?",
    [id_paciente]
  );

  if (existing.length > 0) {
    // Actualizar
    const sql = `
      UPDATE consentimientos 
      SET aviso_privacidad = ?, terminos_condiciones = ?, actualizado_en = CURRENT_TIMESTAMP
      WHERE id_paciente = ?
    `;
    const [result] = await pool.query(sql, [aviso_privacidad, terminos_condiciones, id_paciente]);
    return result.affectedRows > 0;
  } else {
    // Crear nuevo
    const sql = `
      INSERT INTO consentimientos (id_paciente, aviso_privacidad, terminos_condiciones)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [id_paciente, aviso_privacidad, terminos_condiciones]);
    return result.insertId;
  }
};

// Obtener consentimientos por paciente
Consentimiento.findByPacienteId = async (id_paciente) => {
  const sql = `
    SELECT id_consentimiento, aviso_privacidad, terminos_condiciones, creado_en, actualizado_en
    FROM consentimientos 
    WHERE id_paciente = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [id_paciente]);
  return rows[0] || null;
};

export default Consentimiento;