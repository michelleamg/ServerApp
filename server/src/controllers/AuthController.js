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

      // Buscar al usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No existe una cuenta con este correo" });
      }

      // Aquí podrías generar un token temporal o un código de verificación
      // De momento, simulamos que se envió el correo
      console.log(`📧 Enlace de recuperación enviado a: ${email}`);

      return res.status(200).json({ 
        message: "Se ha enviado un enlace para restablecer tu contraseña al correo proporcionado." 
      });

    } catch (err) {
      console.error("Error en recoverPassword:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }

  
};