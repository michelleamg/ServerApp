import { pool } from "../db/db.js"; // tu pool de mysql2/promise

export const PacienteModel = {
  // 🔹 Obtener un paciente por ID
  async getById(id_paciente) {
    const [rows] = await pool.query(
      "SELECT id_paciente AS id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email, foto FROM paciente WHERE id_paciente = ?",
      [id_paciente]
    );
    return rows[0];
  },

  // 🔹 Actualizar paciente
  async updateById(id_paciente, data, file) {
    if (!data) throw new Error("Datos no recibidos en updateById");

    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      telefono,
      email,
    } = data;

    // Construir la query dinámica
    let sql = `
      UPDATE paciente
      SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
          fecha_nacimiento = ?, telefono = ?, email = ?
    `;
    const values = [
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      telefono,
      email,
    ];

    // Si hay archivo, agrega el campo foto
    if (file) {
      sql += ", foto = ?";
      values.push(file.filename);
    }

    sql += " WHERE id_paciente = ?";
    values.push(id_paciente);

    // Ejecutar actualización
    await pool.query(sql, values);

    // Recuperar datos actualizados (corrigiendo el nombre de la tabla)
    const [rows] = await pool.query(
      "SELECT * FROM paciente WHERE id_paciente = ?",
      [id_paciente]
    );

    return rows[0];
  },
};
