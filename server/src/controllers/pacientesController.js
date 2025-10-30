import { PacienteModel as Paciente } from "../models/pacientemodel.js";

export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.getById(id);

    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json(paciente);
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;   // Campos de texto
    const file = req.file;   // Imagen si viene

    console.log("🧾 Data recibida:", data);
    console.log("🖼️ Archivo recibido:", file ? file.filename : "ninguno");

    const result = await Paciente.updateById(id, data, file);
    res.json(result);
  } catch (error) {
    console.error("❌ Error al actualizar paciente:", error);
    res.status(500).json({ message: "Error al actualizar paciente" });
  }
};


