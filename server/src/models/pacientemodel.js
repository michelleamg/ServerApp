import { pool } from "../db.js"; // tu pool de mysql2/promise

export const PacienteModel = {
  async getById(id_paciente) {
    const [rows] = await pool.query(
      "SELECT id_paciente AS id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email FROM pacientes WHERE id_paciente = ?",
      [id_paciente]
    );
    return rows[0];
  },

  async updateById(id_paciente, data) {
    const { nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email } = data;

    await pool.query(
      `UPDATE pacientes 
       SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
           fecha_nacimiento = ?, telefono = ?, email = ?
       WHERE id_paciente = ?`,
      [nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email, id_paciente]
    );

    const [rows] = await pool.query("SELECT * FROM pacientes WHERE id_paciente = ?", [id_paciente]);
    return rows[0];
  },
};
