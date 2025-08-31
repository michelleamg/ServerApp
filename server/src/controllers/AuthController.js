import User from '../model/userModel.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const usuario = await User.login(email, password);

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Aquí podrías generar un JWT si quieres
    return res.json({
      message: "Login exitoso",
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (err) {
    console.error("❌ Error en login:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
