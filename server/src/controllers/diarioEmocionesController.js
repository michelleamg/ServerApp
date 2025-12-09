import DiarioEmociones from "../models/diarioEmocionesModel.js";
import pool from "../db/db.js";

export const DiarioEmocionesController = {
  // 🔹 Registrar emoción
  async registrar(req, res) {
    try {
      const { id_paciente, emocion, nota, fecha } = req.body;

      console.log("📥 Datos recibidos:", { id_paciente, emocion, nota, fecha });

      if (!id_paciente || !emocion || !fecha) {
        console.warn("⚠️ Faltan datos requeridos para registrar emoción");
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }

      const newId = await DiarioEmociones.create(id_paciente, emocion, nota, fecha);

      console.log("✅ Emoción guardada con ID:", newId);

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

  async compartir(req, res) {
    try {
      const { id_diario } = req.params;

      const [result] = await pool.query(
        `UPDATE diario_emociones SET compartido = 1 WHERE id_diario = ?`,
        [id_diario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No se encontró la entrada" });
      }

      return res.status(200).json({ message: "Entrada compartida con el psicólogo" });
    } catch (error) {
      console.error("❌ Error al compartir entrada:", error);
      res.status(500).json({ message: "Error al compartir", error: error.message });
    }
  }

};
