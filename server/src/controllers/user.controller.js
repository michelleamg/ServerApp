import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Actualizar nombre de usuario
export const updateUsername = async (req, res) => {
  try {
    const { id, newUsername } = req.body;
    if (!id || !newUsername) {
      return res.status(400).json({ message: "Faltan campos (id, newUsername)" });
    }

    const [result] = await pool.query(
      "UPDATE users SET username = ? WHERE id = ?",
      [newUsername, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Nombre de usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el nombre de usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar correo electrónico
export const updateEmail = async (req, res) => {
  try {
    const { id, newEmail } = req.body;
    if (!id || !newEmail) {
      return res.status(400).json({ message: "Faltan campos (id, newEmail)" });
    }

    const [users] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const [dup] = await pool.query("SELECT id FROM users WHERE email = ?", [newEmail]);
    if (dup.length > 0) {
      return res.status(409).json({ message: "El correo ya está en uso" });
    }

    const [result] = await pool.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, id]);
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar el correo" });
    }

    return res.status(200).json({ message: "Correo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el correo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    if (!id || !newPassword) {
      return res.status(400).json({ message: "Faltan campos (id, newPassword)" });
    }

    const [users] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      "UPDATE users SET user_password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar la contraseña" });
    }

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Falta el campo email" });
    }

    const [result] = await pool.query("DELETE FROM users WHERE email = ?", [email]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
// Obtener información del usuario