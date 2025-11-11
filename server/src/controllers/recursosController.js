import { RecursosModel } from "../models/recursosModel.js";

export const RecursosController = {
  async getRecursos(req, res) {
    try {
      const { id_paciente } = req.params;
      if (!id_paciente)
        return res.status(400).json({ success: false, error: "ID de paciente requerido" });

      const recursos = await RecursosModel.getRecursosPorPaciente(id_paciente);
      res.json({ success: true, recursos });
    } catch (error) {
      console.error("❌ Error en getRecursos:", error);
      res.status(500).json({ success: false, error: "Error al obtener recursos" });
    }
  },
};
