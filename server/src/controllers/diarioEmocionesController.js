import DiarioEmociones from "../models/diarioEmocionesModel.js";
import pool from "../db/db.js";

export const DiarioEmocionesController = {
  // 🔹 Registrar emoción
  async registrar(req, res) {
    try {
      const { id_paciente, emocion, nota, fecha } = req.body;

      if (!id_paciente || !emocion || !fecha) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }

      const newId = await DiarioEmociones.create(id_paciente, emocion, nota, fecha);

      return res.status(201).json({
        message: "Emoción registrada correctamente",
        id_diario: newId,
      });
    } catch (error) {
      console.error("❌ Error al registrar emoción:", error);
      res.status(500).json({ message: "Error al registrar emoción", error: error.message });
    }
  },

  // 🔹 Listar emociones del mes
  async listarMensual(req, res) {
    try {
      const { id_paciente, year, month } = req.params;
      const emociones = await DiarioEmociones.findByPacienteAndMonth(id_paciente, year, month);
      res.status(200).json({ emociones });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener emociones", error: error.message });
    }
  },

  // 🔹 Obtener última emoción registrada
  async obtenerUltima(req, res) {
    try {
      const { id_paciente } = req.params;

      const [rows] = await pool.query(
        `SELECT DATE(MAX(fecha)) AS ultima_emocion 
         FROM diario_emociones 
         WHERE id_paciente = ?`,
        [id_paciente]
      );

      return res.status(200).json({
        ultima_emocion: rows[0]?.ultima_emocion || null,
      });
    } catch (error) {
      console.error("❌ Error al obtener última emoción:", error);
      return res.status(500).json({
        message: "Error al obtener la última emoción",
        error: error.message,
      });
    }
  },
};
