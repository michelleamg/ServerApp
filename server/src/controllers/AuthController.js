import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

      // Generar token JWT
      const token = jwt.sign(
        { sub: newId, role: "paciente" },
        process.env.JWT_SECRET || "d98!ae4h4UBh5hUguiPY59",
        { expiresIn: "7d" }
      );

      // Guardar token en la base de datos
      await User.saveSessionToken(newId, token);

      return res.status(201).json({
        message: "Paciente registrado exitosamente",
        token,
        user: { 
          id_paciente: newId, 
          nombre, 
          email,
          session_token: token 
        },
      });
    } catch (err) {
      console.error(" Error en register:", err);
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

      // usa 'contrasena' (como está en tu tabla)
      const match = await bcrypt.compare(password, user.contrasena || "");
      if (!match) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const consent = await User.findConsentimientos(user.id_paciente);
      
      // Generar nuevo token
      const token = jwt.sign(
        { sub: user.id_paciente, role: "paciente" },
        process.env.JWT_SECRET || "d98!ae4h4UBh5hUguiPY59",
        { expiresIn: "7d" }
      );

      // Actualizar token en la base de datos
      await User.saveSessionToken(user.id_paciente, token);

      return res.status(200).json({
        message: "Login exitoso",
        token,
        user: {
          id_paciente: user.id_paciente,
          nombre: user.nombre,
          email: user.email,
          aviso_privacidad: consent?.aviso_privacidad || 0,
          terminos_condiciones: consent?.terminos_condiciones || 0,
          session_token: token
        },
      });
    } catch (err) {
      console.error(" Error en login:", err);
      return res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
  },

  // Middleware para verificar token (opcional, para futuras rutas protegidas)
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
      }

      // Verificar si el token existe en la base de datos
      const user = await User.findByToken(token);
      if (!user) {
        return res.status(401).json({ message: "Token inválido" });
      }

      // Verificar firma JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "d98!ae4h4UBh5hUguiPY59");
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  },

    // Recuperación de contraseña
  async recoverPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "El correo es requerido" });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No existe una cuenta con este correo" });
      }

      // Crear token temporal
      const token = crypto.randomBytes(20).toString("hex");
      // 15 minutos a partir de ahora
      const expires = new Date(Date.now() + 15 * 60 * 1000);
      // Guarda token y expiración en BD
      await User.saveResetToken(user.id_paciente, token, expires);
      
      const resetLink = `https://midueloapp.com/reset-password?token=${token}`;

      // Configurar transporte SMTP de Hostinger
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // SSL
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Enviar correo de recuperación
      await transporter.sendMail({
        from: `"MiDuelo Soporte" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Recuperación de contraseña - MiDuelo",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color:#2E7D32;">Hola ${user.nombre || "usuario"},</h2>
            <p>Has solicitado restablecer tu contraseña en <b>MiDuelo</b>.</p>
            <p>Puedes hacerlo haciendo clic en el siguiente enlace:</p>
            <a href="${resetLink}" style="background-color:#4CAF50;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Restablecer contraseña</a>
            <p style="margin-top:20px;">Si no solicitaste esto, puedes ignorar este mensaje.</p>
            <hr/>
            <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} MiDuelo. Todos los derechos reservados.</p>
          </div>
        `,
      });

      console.log(`📧 Correo de recuperación enviado a: ${email}`);
      return res.status(200).json({ message: "Se ha enviado un enlace de recuperación a tu correo." });

    } catch (err) {
      console.error("❌ Error en recoverPassword:", err);
      return res.status(500).json({ message: "Error al enviar el correo", error: err.message });
    }
  },

  // Aplicar nueva contraseña usando el token
async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Faltan datos" });
      }

      const user = await User.findByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await User.updatePassword(user.id_paciente, hashed);
      await User.clearResetToken(user.id_paciente);

      return res.status(200).json({ message: "Contraseña restablecida correctamente" });
    } catch (err) {
      console.error("❌ Error en resetPassword:", err);
      return res.status(500).json({ message: "Error al restablecer contraseña" });
    }
  }


  
};