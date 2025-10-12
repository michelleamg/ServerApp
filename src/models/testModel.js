import pool from '../db/db.js';

export const TestModel = {
  async createApplication(id_test, id_paciente, id_psicologo) {
    const [result] = await pool.query(
      'INSERT INTO aplicacion_test (id_test, id_paciente, id_psicologo) VALUES (?, ?, ?)',
      [id_test, id_paciente, id_psicologo]
    );
    return result.insertId;
  },

  async saveResponses(id_aplicacion, respuestas) {
    const values = respuestas.map(({ pregunta, respuesta }) => [id_aplicacion, pregunta, respuesta]);
    const [result] = await pool.query(
      'INSERT INTO respuesta_test (id_aplicacion, pregunta, respuesta) VALUES ?',
      [values]
    );
    return result.affectedRows;
  },

  async saveResult(id_aplicacion, total, interpretacion) {
    const [result] = await pool.query(
      'INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion) VALUES (?, ?, ?)',
      [id_aplicacion, total, interpretacion]
    );
    return result.insertId;
    },

  async getAllTests() {
    const [rows] = await pool.query('SELECT id_test, nombre, descripcion FROM test');
    return rows;
  },
};