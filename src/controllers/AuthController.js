import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"
import crypto from "crypto";
import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "../db/config.js";

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

      console.log("SMTP_USER:", SMTP_USER);
      console.log("SMTP_PASS:", SMTP_PASS ? "✅ existe" : "❌ vacío");


      // 3️⃣ Configurar SMTP de Hostinger
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST || "smtp.hostinger.com",
        port: SMTP_PORT || 465,
        secure: true, // 465 requiere SSL
        auth: {
          user:SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // ✅ evita error de certificado en local
        },
      });

      // 4️⃣ Enlace con token visible (hash no se manda)
      const verifyUrl = `http://192.168.1.80:3000/api/verify/${encodeURIComponent(
        rawToken
      )}`;

      // 5️⃣ Enviar correo real
      await transporter.sendMail({
        from: `"MiDueloApp 💚" <${SMTP_USER}>`,
        to: email,
        subject: "Verifica tu cuenta en MiDueloApp",
        html: `
          <h2>¡Hola ${nombre || "usuario"}!</h2>
          <p>Gracias por registrarte en <b>MiDueloApp</b>.</p>
          <p>Confirma tu cuenta haciendo clic en el siguiente botón:</p>
          <a href="${verifyUrl}" 
             style="background:#2F5249;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
             Verificar mi correo
          </a>
          <p>Este enlace expirará en 24 horas.</p>
        `,
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
};