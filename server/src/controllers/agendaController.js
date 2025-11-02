import pool from "../db/db.js";
import moment from "moment";

export const AgendaController = {
  /* ========================================================
     📅 1️⃣ Obtener semanas y citas del psicólogo vinculado al paciente
     ======================================================== */
  async getSemanasPorPaciente(req, res) {
    try {
      const { id_paciente } = req.params;

      // 1️⃣ Buscar el psicólogo asociado al paciente
      const [pacienteRows] = await pool.query(
        "SELECT id_psicologo FROM paciente WHERE id_paciente = ? LIMIT 1",
        [id_paciente]
      );

      if (pacienteRows.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const id_psicologo = pacienteRows[0].id_psicologo;
      if (!id_psicologo) {
        return res
          .status(404)
          .json({ message: "El paciente no tiene psicólogo asignado" });
      }

      // 2️⃣ Calcular el primer lunes del mes actual y limitar a 5 semanas
      const primerLunes = moment().startOf("month").startOf("isoWeek");
      const semanas = [];

      for (let i = 0; i < 5; i++) {
        const semanaInicio = primerLunes.clone().add(i, "weeks");
        const semanaFin = semanaInicio.clone().add(6, "days");

        // 3️⃣ Traer TODAS las citas del psicólogo (no solo del paciente)
        const [citas] = await pool.query(
          `SELECT 
              c.id_cita,
              c.fecha,
              c.hora_inicio,
              c.hora_fin,
              c.modalidad,
              c.estado,
              p.nombre AS nombre_paciente
            FROM cita c
            INNER JOIN agenda a ON c.id_agenda = a.id_agenda
            LEFT JOIN paciente p ON c.id_paciente = p.id_paciente
            WHERE a.id_psicologo = ?
              AND c.fecha BETWEEN ? AND ?
            ORDER BY c.fecha, c.hora_inicio`,
          [
            id_psicologo,
            semanaInicio.format("YYYY-MM-DD"),
            semanaFin.format("YYYY-MM-DD"),
          ]
        );

        // 4️⃣ Agregar estado visual según la fecha actual
        const ahora = moment();
        const citasConEstado = citas.map((cita) => {
          const fechaHoraFin = moment(`${cita.fecha} ${cita.hora_fin}`);
          let estado_visual = cita.estado;

          if (cita.estado === "confirmada" && fechaHoraFin.isBefore(ahora)) {
            estado_visual = "pasado"; // gris
          }

          return { ...cita, estado_visual };
        });

        // 5️⃣ Agregar semana con sus citas
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

  /* ========================================================
     📅 2️⃣ Obtener todas las semanas de un psicólogo específico
     ======================================================== */
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

  /* ========================================================
     📅 3️⃣ Obtener citas dentro de una semana específica
     ======================================================== */
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

  /* ========================================================
     🆕 4️⃣ Solicitar nueva cita (registrar cita como pendiente)
     ======================================================== */
  async solicitarCita(req, res) {
    try {
      const { id_paciente, fecha, hora_inicio, hora_fin, modalidad } = req.body;

      if (!id_paciente || !fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }

      // 1️⃣ Buscar psicólogo asociado al paciente
      const [pacienteRows] = await pool.query(
        "SELECT id_psicologo FROM paciente WHERE id_paciente = ? LIMIT 1",
        [id_paciente]
      );

      if (pacienteRows.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const id_psicologo = pacienteRows[0].id_psicologo;

      // 2️⃣ Buscar o crear agenda activa del psicólogo
      const [agendaRows] = await pool.query(
        `SELECT id_agenda 
         FROM agenda 
         WHERE id_psicologo = ?
           AND ? BETWEEN semana_inicio AND semana_fin
         LIMIT 1`,
        [id_psicologo, fecha]
      );

      let id_agenda;
      if (agendaRows.length === 0) {
        // Crear una agenda si no existe para esa semana
        const semanaInicio = moment(fecha).startOf("isoWeek").format("YYYY-MM-DD");
        const semanaFin = moment(fecha).endOf("isoWeek").format("YYYY-MM-DD");

        const [nuevaAgenda] = await pool.query(
          `INSERT INTO agenda (id_psicologo, semana_inicio, semana_fin)
           VALUES (?, ?, ?)`,
          [id_psicologo, semanaInicio, semanaFin]
        );
        id_agenda = nuevaAgenda.insertId;
      } else {
        id_agenda = agendaRows[0].id_agenda;
      }

      // 3️⃣ Insertar nueva cita como pendiente
      const [result] = await pool.query(
        `INSERT INTO cita (id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [id_agenda, id_paciente, fecha, hora_inicio, hora_fin, modalidad || "En línea"]
      );

      res.status(201).json({
        message: "Cita solicitada con éxito. Espera confirmación del psicólogo.",
        id_cita: result.insertId,
        id_agenda,
      });
    } catch (error) {
      console.error("❌ Error al solicitar cita:", error);
      res.status(500).json({ message: "Error al solicitar cita", error });
    }
  },
};
