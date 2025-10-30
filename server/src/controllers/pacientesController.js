import { PacienteModel } from "../models/pacientemodel.js";

export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await PacienteModel.getById(id);

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
    const result = await Paciente.updateById(id, req.body); // 👈 asegúrate de pasar req.body
    res.json(result);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ message: "Error al actualizar paciente" });
  }
};


