import pool from '../db/db.js';

const User = {};

User.login = async (email, password) => {
  try {
    const sql = 'SELECT * FROM paciente WHERE email = ? AND contrasena = ?';
    const [rows] = await pool.query(sql, [email, password]);

    if (rows.length > 0) {
      return rows[0]; // usuario encontrado
    } else {
      return null; // no existe
    }
  } catch (err) {
    throw err;
  }
};

export default User;
