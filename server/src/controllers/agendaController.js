// controllers/agendaController.js
import pool from "../db/db.js";
import moment from "moment";

export const AgendaController = {
  // 🔹 Obtener las primeras 5 semanas del mes actual (desde lunes) del psicólogo vinculado al paciente
  async getSemanasPorPaciente(req, res) {
    try {
      const { id_paciente } = req.params;

      if (!id_paciente) {
        return res.status(400).json({ message: "Falta el id_paciente" });
      }

      // 1️⃣ Obtener el psicólogo vinculado al paciente
      const [pacienteRows] = await pool.query(
        "SELECT id_psicologo FROM paciente WHERE id_paciente = ? LIMIT 1",
        [id_paciente]
      );

      if (pacienteRows.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const id_psicologo = pacienteRows[0].id_psicologo;

      // 2️⃣ Calcular el primer lunes del mes actual y limitar a 5 semanas
      const primerLunes = moment().startOf("month").startOf("isoWeek");
      const semanas = [];

      for (let i = 0; i < 5; i++) {
        const semanaInicio = primerLunes.clone().add(i, "weeks");
        const semanaFin = semanaInicio.clone().add(6, "days");

        // 3️⃣ Traer citas del paciente dentro de esa semana
        const [citas] = await pool.query(
          `SELECT c.id_cita, c.fecha, c.hora_inicio, c.hora_fin, c.modalidad, c.estado
           FROM cita c
           INNER JOIN agenda a ON c.id_agenda = a.id_agenda
           WHERE a.id_psicologo = ?
             AND c.id_paciente = ?
             AND c.fecha BETWEEN ? AND ?
           ORDER BY c.fecha, c.hora_inicio`,
          [
            id_psicologo,
            id_paciente,
            semanaInicio.format("YYYY-MM-DD"),
            semanaFin.format("YYYY-MM-DD"),
          ]
        );

        // 4️⃣ Agregar campo estado_visual según fecha actual
        const ahora = moment();
        const citasConEstado = citas.map((cita) => {
          const fechaHoraFin = moment(`${cita.fecha} ${cita.hora_fin}`);
          let estado_visual = cita.estado;

          if (cita.estado === "confirmada" && fechaHoraFin.isBefore(ahora)) {
            estado_visual = "pasado"; // gris
          }
          return { ...cita, estado_visual };
        });

        // Agregar semana con sus citas
        semanas.push({
          semana_inicio: semanaInicio.toDate(),
          semana_fin: semanaFin.toDate(),
          citas: citasConEstado,
        });
      }

      return res.status(200).json({ id_psicologo, semanas });
    } catch (error) {
      console.error("❌ Error en getSemanasPorPaciente:", error);
      return res.status(500).json({
        message: "Error al obtener agenda del paciente",
        error: error.message,
      });
    }
  },

  // 🔹 Obtener todas las semanas de un psicólogo específico
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

  // 🔹 Obtener citas dentro de una semana específica
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

  // 🔹 Solicitar nueva cita
  async solicitarCita(req, res) {
    try {
      const { id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad } = req.body;

      if (!id_agenda || !id_paciente || !fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }

      // 💡 Insertar nueva cita como pendiente
      const [result] = await pool.query(
        `INSERT INTO cita (id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad || "En línea"]
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
};
