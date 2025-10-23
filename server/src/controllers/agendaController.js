// controllers/agendaController.js
import pool from "../db/db.js";

export const AgendaController = {
  // Obtener todas las semanas disponibles del psicólogo
  async getSemanas(req, res) {
    try {
      const { id_psicologo } = req.params;
      const [rows] = await pool.query(
        `SELECT * FROM agenda WHERE id_psicologo = ? ORDER BY semana_inicio ASC`,
        [id_psicologo]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("❌ Error al obtener semanas:", error);
      res.status(500).json({ message: "Error al obtener agenda", error });
    }
  },

  // Obtener citas dentro de una semana específica
  async getCitasSemana(req, res) {
    try {
      const { id_agenda } = req.params;
      const [rows] = await pool.query(
        `SELECT id_cita, fecha, hora_inicio, hora_fin, modalidad, estado 
         FROM cita 
         WHERE id_agenda = ?
         ORDER BY fecha, hora_inicio`,
        [id_agenda]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("❌ Error al obtener citas:", error);
      res.status(500).json({ message: "Error al obtener citas", error });
    }
  },

  // Solicitar una nueva cita
  async solicitarCita(req, res) {
    try {
      const { id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad } = req.body;

      if (!id_agenda || !id_paciente || !fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }

      const [result] = await pool.query(
        `INSERT INTO cita (id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad || "virtual"]
      );

      res.status(201).json({
        message: "Cita solicitada con éxito. Espera confirmación del psicólogo.",
        id_cita: result.insertId,
      });
    } catch (error) {
      console.error("❌ Error al solicitar cita:", error);
      res.status(500).json({ message: "Error al solicitar cita", error });
    }
  },

  // Obtener las semanas disponibles del psicólogo vinculado al paciente
async getSemanasPorPaciente(req, res) {
    try {
      const { id_paciente } = req.params;

      if (!id_paciente) {
        return res.status(400).json({ message: "Falta el id_paciente" });
      }

      // 1️⃣ Buscar el id_psicologo vinculado al paciente
      const [pacienteRows] = await pool.query(
        "SELECT id_psicologo FROM paciente WHERE id_paciente = ? LIMIT 1",
        [id_paciente]
      );

      if (pacienteRows.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const id_psicologo = pacienteRows[0].id_psicologo;

      // 2️⃣ Consultar la agenda de ese psicólogo
      const [agendaRows] = await pool.query(
        `SELECT * 
        FROM agenda 
        WHERE id_psicologo = ?
        ORDER BY semana_inicio ASC`,
        [id_psicologo]
      );

      res.status(200).json({
        id_psicologo,
        semanas: agendaRows,
      });
    } catch (error) {
      console.error("❌ Error en getSemanasPorPaciente:", error);
      res.status(500).json({ message: "Error al obtener la agenda del paciente", error });
    }
  }

};
