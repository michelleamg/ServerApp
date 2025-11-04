import {
  obtenerActividadesPorPaciente,
  registrarOActualizarActividadPaciente,
} from "../models/actividadesModel.js";

export const getActividadesPaciente = async (req, res) => {
  const { id_paciente } = req.params;

  try {
    const actividades = await obtenerActividadesPorPaciente(id_paciente);
    res.status(200).json(actividades);
  } catch (error) {
    console.error("❌ Error al obtener actividades del paciente:", error);
    res.status(500).json({ message: "Error al obtener actividades" });
  }
};


export const postActividadPaciente = async (req, res) => {
  try {
    const data = req.body;
    if (!data.id_paciente || !data.id_actividad) {
      return res.status(400).json({ message: "Faltan parámetros obligatorios" });
    }

    const result = await registrarOActualizarActividadPaciente(data);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error al registrar actividad paciente:", error);
    res.status(500).json({ message: "Error al registrar evidencia" });
  }
};
