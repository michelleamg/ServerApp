import { PacienteModel } from "../models/pacientemodel.js";

export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await PacienteModel.getById(id);

    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json(paciente);
  } catch (error) {
    console.error("❌ Error al obtener paciente:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🛠️ Actualizar datos del perfil
export const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email } = req.body;

    if (fecha_nacimiento) {
      fecha_nacimiento = fecha_nacimiento.split("T")[0];
    }

    const updated = await PacienteModel.updateById(id, {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      telefono,
      email,
    });

    res.json({ message: "Perfil actualizado con éxito", paciente: updated });
  } catch (error) {
    console.error("❌ Error al actualizar paciente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateFotoPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No se recibió imagen" });

    // ✅ Generar URL completa según el entorno (local)
    const fotoRuta = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    await PacienteModel.updateFotoPerfil(id, fotoRuta);

    const updated = await PacienteModel.getById(id);
    res.json({
      message: "Foto de perfil actualizada con éxito",
      paciente: updated,
    });
  } catch (error) {
    console.error("❌ Error al actualizar foto de perfil:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};