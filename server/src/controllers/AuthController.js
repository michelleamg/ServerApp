import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const AuthController = {
  // Registro de paciente
  async register(req, res) {
    try {
      const {
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        telefono,
        email,
        password,
        codigo_psicologo,
      } = req.body;

      if (!nombre || !apellido_paterno || !email || !password || !codigo_psicologo) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
      }

      // Verificar que no exista ya
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear paciente
      const newId = await User.create({
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        telefono,
        email,
        contrasena: hashedPassword,
        codigo_psicologo,
      });

      return res.status(201).json({
        message: "Paciente registrado exitosamente",
        user: { id_paciente: newId, nombre, email },
      });
    } catch (err) {
      console.error("❌ Error en register:", err);
      return res.status(500).json({ message: "Error en el registro", error: err.message });
    }
  },

  // Login de paciente
  async login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 👇 usa 'contrasena' (como está en tu tabla)
    const match = await bcrypt.compare(password, user.contrasena || "");
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { sub: user.id_paciente, role: "paciente" },
      process.env.JWT_SECRET || "mi_super_secreto",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id_paciente: user.id_paciente,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
}
};
