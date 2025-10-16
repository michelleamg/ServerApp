import pool from '../db/db.js';

const User = {};

// Buscar paciente por email
User.findByEmail = async (email) => {
  const sql = `
    SELECT id_paciente, nombre, apellido_paterno, apellido_materno, email, 
           contrasena, telefono, id_psicologo, session_token
    FROM paciente
    WHERE email = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

// Consultar consentimientos del paciente
User.findConsentimientos = async (id_paciente) => {
  const sql = `
    SELECT aviso_privacidad, terminos_condiciones
    FROM consentimientos
    WHERE id_paciente = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [id_paciente]);
  return rows[0] || null;
};

// Crear paciente vinculado a psicólogo
User.create = async (data) => {
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
      (nombre, apellido_paterno, apellido_materno, 
      fecha_nacimiento, email, 
      contrasena, telefono, id_psicologo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    data.nombre,
    data.apellido_paterno,
    data.apellido_materno,
    data.fecha_nacimiento,
    data.email,
    data.contrasena,
    data.telefono,
    id_psicologo,
  ]);

  return result.insertId;
};

//Usar los nombres correctos de las columnas
User.saveSessionToken = async (id_paciente, token) => {
  const sql = `
    UPDATE paciente 
    SET session_token = ?, actualizada_en = CURRENT_TIMESTAMP
    WHERE id_paciente = ?
  `;
  const [result] = await pool.query(sql, [token, id_paciente]);
  return result.affectedRows > 0;
};

// 🔥 CORREGIDO: Usar los nombres correctos
User.findByToken = async (token) => {
  const sql = `
    SELECT id_paciente, nombre, apellido_paterno, apellido_materno, email, 
           telefono, id_psicologo, creada_en
    FROM paciente
    WHERE session_token = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [token]);
  return rows[0] || null;
};

export default User;