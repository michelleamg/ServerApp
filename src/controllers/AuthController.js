import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"

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
  }

  
};