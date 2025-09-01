import pool from '../db/db.js';

const User = {};

// Buscar paciente por email
User.findByEmail = async (email) => {
  const sql = `
    SELECT id_paciente, nombre, apellido_paterno, apellido_materno, email, contrasena, telefono, id_psicologo
    FROM paciente
    WHERE email = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

// Crear paciente vinculado a psicólogo
User.create = async (data) => {
  // buscar id_psicologo a partir del codigo_vinculacion
  const [rows] = await pool.query(
    "SELECT id_psicologo FROM psicologo WHERE codigo_vinculacion = ? LIMIT 1",
    [data.codigo_psicologo]
  );

  if (rows.length === 0) {
    throw new Error("Código de psicólogo inválido");
  }

  const id_psicologo = rows[0].id_psicologo;

  const sql = `
    INSERT INTO paciente
      (nombre, apellido_paterno, apellido_materno, fecha_nacimiento, email, contrasena, telefono, id_psicologo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    data.nombre,
    data.apellido_paterno,
    data.apellido_materno,
    data.fecha_nacimiento,
    data.email,
    data.contrasena, // ya encriptada
    data.telefono,
    id_psicologo,
  ]);

  return result.insertId;
};

export default User;
