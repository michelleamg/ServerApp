import { pool } from "../db/db.js"; // tu pool de mysql2/promise

export const PacienteModel = {
  async getById(id_paciente) {
    const [rows] = await pool.query(
      `SELECT id_paciente AS id, nombre, apellido_paterno, apellido_materno,
              fecha_nacimiento, telefono, email, foto_perfil
       FROM paciente WHERE id_paciente = ?`,
      [id_paciente]
    );
    return rows[0];
  },

  async updateById(id_paciente, data) {
    const { nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email } = data;

    await pool.query(
      `UPDATE paciente
       SET nombre = ?, apellido_paterno = ?, apellido_materno = ?,
           fecha_nacimiento = ?, telefono = ?, email = ?
       WHERE id_paciente = ?`,
      [nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email, id_paciente]
    );

    const [rows] = await pool.query("SELECT * FROM paciente WHERE id_paciente = ?", [id_paciente]);
    return rows[0];
  },

  async updateFotoPerfil(id_paciente, fotoRuta) {
    const [result] = await pool.query(
      "UPDATE paciente SET foto_perfil = ? WHERE id_paciente = ?",
      [fotoRuta, id_paciente]
    );
    return result;
  },
};
