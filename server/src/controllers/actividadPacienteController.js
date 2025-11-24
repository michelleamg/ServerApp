import { ActividadPaciente } from "../models/actividadPacienteModel.js";

export const registrarActividadPaciente = async (req, res) => {
  try {
    const {
      id_paciente,
      id_actividad,
      estado,
      evidencia_texto,
      evidencia_foto,
      duracion_segundos
    } = req.body;

    if (!id_paciente || !id_actividad) {
      return res.status(400).json({
        success: false,
        error: "id_paciente e id_actividad son requeridos"
      });
    }

    const result = await ActividadPaciente.registrar({
      id_paciente,
      id_actividad,
      estado,
      evidencia_texto,
      evidencia_foto,
      duracion_segundos
    });

    return res.status(201).json({
      success: true,
      id_actividad_paciente: result.id
    });

  } catch (error) {
    console.error("Error registrar actividad paciente:", error);
    return res.status(500).json({
      success: false,
      error: "Error al registrar actividad del paciente"
    });
  }
};

export const registrarActividadPacienteFoto = async (req, res) => {
  try {
    const { id_paciente, id_actividad, estado } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ success: false, error: "No se envió archivo" });
    }

    const evidencia_foto = `/uploads/evidencias/${archivo.filename}`;

    const result = await ActividadPaciente.registrar({
      id_paciente,
      id_actividad,
      estado: estado || "completada",
      evidencia_foto,
      evidencia_texto: null,
      duracion_segundos: null
    });

    return res.status(201).json({
      success: true,
      message: "Evidencia fotográfica guardada",
      path: evidencia_foto,
      id_actividad_paciente: result.id
    });

  } catch (error) {
    console.error("Error registrar foto:", error);
    return res.status(500).json({
      success: false,
      error: "Error al guardar evidencia fotográfica"
    });
  }
};



export const getActividadesPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    if (!id_paciente) {
      return res.status(400).json({
        success: false,
        error: "El id_paciente es requerido"
      });
    }

    const registros = await ActividadPaciente.getByPaciente(id_paciente);

    return res.status(200).json({
      success: true,
      registros
    });

  } catch (error) {
    console.error("Error getActividadesPaciente:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener actividades del paciente"
    });
  }
};
