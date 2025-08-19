import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Actualizar nombre de usuario
export const updateUsername = async (req, res) => {
  try {
    const { id, newUsername } = req.body;
    console.log(req.body.username);
    await pool.query("UPDATE users SET username = ? WHERE id = ?", [
      req.body.username,
      id,
    ]);

    return res
      .status(200)
      .json({ message: "Nombre de usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el nombre de usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar correo electrónico
export const updateEmail = async (req, res) => {
  const { id, newEmail } = req.body;

  if (!id || !newEmail) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos (id, correo)" });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (user.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const emailExists = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [newEmail]
    );

    if (emailExists.rowCount > 0) {
      return res.status(409).json({ message: "El correo ya está en uso" });
    }

    await pool.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, id]);

    return res
      .status(200)
      .json({ message: "Correo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el correo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  const { id, newPassword } = req.body;

  if (!id || !newPassword) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos (id, contraseña)" });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (user.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET user_password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

