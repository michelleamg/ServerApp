import { pool } from "../db.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10);
  try {
    const [rows] = await pool.query("SELECT * FROM paciente WHERE email = ?", [
      email,
    ]);
    console.log(rows);
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.user_password);
      if (match) {
        return res.status(200).json({
          message: "Inicio de sesión exitoso",
          user: rows,
        });
      }
    }
    res.status(401).json({ message: "Credenciales incorrectas" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const register = async (req, res) => {
  const { email } = req.body;
  const [existingUser] = await pool.query(
    "SELECT * FROM Users WHERE email = ?",
    [email]
  );
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await pool.query(
      "INSERT INTO Users (username, email, user_password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    res.status(201).json({
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: error.sqlMessage,
    });
  }
};