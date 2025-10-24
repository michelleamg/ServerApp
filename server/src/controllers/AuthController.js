import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "../db/config.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const fecha = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

export const AuthController = {
  // Registro de paciente
  async register(req, res) {
    try {
      let {
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        telefono,
        email,
        password,
        codigo_psicologo,
      } = req.body;

      // 🔹 Limpieza de datos
      nombre = nombre?.trim();
      apellido_paterno = apellido_paterno?.trim();
      apellido_materno = apellido_materno?.trim();
      telefono = telefono?.trim();
      email = email?.trim().toLowerCase();
      password = password?.trim();
      codigo_psicologo = codigo_psicologo?.trim();

      // 🔹 Validar campos obligatorios
      if (!nombre || !apellido_paterno || !email || !password || !codigo_psicologo) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
      }

      // 🔹 Validar edad mínima
      const edad = calcularEdad(fecha_nacimiento);
      if (edad < 18) {
        return res.status(400).json({ message: "Debes ser mayor de 18 años para registrarte." });
      }

      // Verificar que no exista el usuario
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      // 🔹 Encriptar contraseña
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

      // Generar token
      const token = jwt.sign(
        { sub: newId, role: "paciente" },
        process.env.JWT_SECRET || "d98!ae4h4UBh5hUguiPY59",
        { expiresIn: "7d" }
      );

      await User.saveSessionToken(newId, token);

      return res.status(201).json({
        message: "Paciente registrado exitosamente",
        token,
        id_paciente: newId, // 🟢 agregado para el front
        user: {
          id_paciente: newId,
          nombre,
          email,
          session_token: token,
        },
      });

    } catch (err) {
      console.error("Error en register:", err);
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

  // Middleware para verificar token
  // ============================================================
  // 🔹 Middleware: verificar JWT en endpoints protegidos
  // ============================================================
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
      }

      // Verificar firma JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "d98!ae4h4UBh5hUguiPY59"
      );

      const user = await User.findById(decoded.sub);
      if (!user) {
        return res.status(401).json({ message: "Token inválido" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("❌ Error en verifyToken:", error);
      return res
        .status(401)
        .json({ message: "Token inválido o expirado", error: error.message });
    }
  },

  // ============================================================
  // 🔹 Enviar correo de verificación (seguro)
  // ============================================================
  async sendVerificationEmail(req, res) {
    try {
      const { id_paciente, email, nombre } = req.body;

      if (!id_paciente || !email) {
        return res
          .status(400)
          .json({ message: "Faltan datos para enviar el correo." });
      }

      // 1️⃣ Generar token aleatorio y hashearlo para guardarlo seguro
      const rawToken = crypto.randomBytes(40).toString("hex");
      const hashedToken = await bcrypt.hash(rawToken, 10);

      // 2️⃣ Guardar token en la BD
      await User.saveVerificationToken(id_paciente, hashedToken);


      // 4️⃣ Enlace con token visible (hash no se manda)
      const verifyUrl = `https://api-mobile.midueloapp.com/api/verify/${encodeURIComponent(
        rawToken
      )}`;

      // 5️⃣ Enviar correo real
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // ✅ Hostinger usa SSL en 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // ⚠️ solo si usas un certificado autofirmado en tu VM
        },
      });

      return res
        .status(200)
        .json({ message: "Correo de verificación enviado correctamente." });
    } catch (err) {
      console.error("❌ Error en sendVerificationEmail:", err);
      return res
        .status(500)
        .json({ message: "Error al enviar correo de verificación." });
    }
  },

  // ============================================================
  // 🔹 Validar correo al abrir enlace
  // ============================================================
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const users = await User.findAllWithTokens();
      let matchedUser = null;

      for (const u of users) {
        const match = await bcrypt.compare(token, u.token_verificacion);
        if (match) {
          matchedUser = u;
          break;
        }
      }

      if (!matchedUser) {
        return res
          .status(400)
          .send("<h2>❌ Enlace inválido o expirado.</h2>");
      }

      await User.verifyEmail(matchedUser.id_paciente);
      res.send(
        "<h2>✅ Correo verificado correctamente. ¡Ya puedes iniciar sesión!</h2>"
      );
    } catch (err) {
      console.error("❌ Error en verifyEmail:", err);
      res
        .status(500)
        .send("<h2>⚠️ Error interno del servidor.</h2>");
    }
  },

    // Recuperación de contraseña
  // Recuperación de contraseña (versión simplificada con token en el correo)
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

        // Crear token y expiración
        const token = crypto.randomBytes(4).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        await User.saveResetToken(user.id_paciente, token, expires);

        // Configurar SMTP
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true, // SSL
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Enviar correo con token directamente
        // Enviar correo con el token en texto verde
        await transporter.sendMail({
          from: `"MiDuelo Soporte" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Recuperación de contraseña - MiDuelo",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color:#2E7D32;">Hola ${user.nombre || "usuario"},</h2>
              <p>Has solicitado restablecer tu contraseña en <b>MiDuelo</b>.</p>
              <p>Usa el siguiente código en la aplicación móvil para restablecer tu contraseña:</p>
              <div style="
                background-color:#4CAF50;
                color:#fff;
                display:inline-block;
                font-size:20px;
                font-weight:bold;
                padding:10px 25px;
                border-radius:8px;
                margin:15px 0;
              ">
                ${token}
              </div>
              <p>Este código expirará en 15 minutos.</p>
              <p style="margin-top:20px;">Si no solicitaste esto, puedes ignorar este mensaje.</p>
              <hr/>
              <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} MiDuelo. Todos los derechos reservados.</p>
            </div>
          `,
        });

        console.log(`📧 Token enviado a ${email}: ${token}`);
        return res.status(200).json({ message: "Se ha enviado un código de recuperación a tu correo." });

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