import pool from '../db/db.js';
import { Test } from '../models/TestResult.js';

export const testController = {

  // Obtener preguntas
  getQuestions: async (req, res) => {
    try {
      const questions = Test.getQuestions();
      res.json({ success: true, questions });
    } catch (error) {
      console.error("❌ Error en getQuestions:", error);
      res.status(500).json({ success: false, error: "Error al obtener preguntas" });
    }
  },

  // -----------------------------
  //   GUARDAR TEST INICIAL
  // -----------------------------
  // -----------------------------
//   GUARDAR TEST INICIAL
// -----------------------------
saveResults: async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { userId, answers } = req.body;

    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Datos incompletos"
      });
    }

    // Crear aplicación del test inicial (tipo 1)
    const id_aplicacion = await Test.createApplication(1, userId, 1);

    // Guardar cada respuesta
    for (const ans of answers) {
      await connection.query(
        `INSERT INTO respuesta_test (id_aplicacion, id_pregunta, pregunta, respuesta)
         VALUES (?, ?, ?, ?)`,
        [
          id_aplicacion,
          ans.questionId,
          Test.getQuestionText(ans.questionId),
          ans.value
        ]
      );
    }

    // SUMAR TODAS las preguntas (1–5)
    const puntajeTotal = answers.reduce(
      (sum, ans) => sum + Number(ans.value),
      0
    );

    // Interpretación basada en puntaje total (21–105)
    const interpretacion =
      puntajeTotal >= 76 ? "Duelo severo" :
      puntajeTotal >= 46 ? "Duelo moderado" :
      "Duelo leve";

    // Guardar resultado final
    await connection.query(
      `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion)
       VALUES (?, ?, ?)`,
      [id_aplicacion, puntajeTotal, interpretacion]
    );

    // Marcar como completado
    await connection.query(
      `UPDATE aplicacion_test SET estado='completado' WHERE id_aplicacion=?`,
      [id_aplicacion]
    );

    await connection.commit();
    connection.release();

    return res.json({
      success: true,
      message: "Test guardado exitosamente",
      puntajeTotal,
      interpretacion
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error en saveResults:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
},


  // Estado test inicial
  getCompletedTest: async (req, res) => {
    try {
      const { id_paciente } = req.params;
      const done = await Test.checkIfCompleted(id_paciente);
      res.json({ hasCompletedTest: done });
    } catch (error) {
      console.error("❌ Error en getCompletedTest:", error);
      res.status(500).json({ hasCompletedTest: false });
    }
  },

  // Último resultado
  getLastResult: async (req, res) => {
    try {
      const { id_paciente } = req.params;
      const result = await Test.getLastResult(id_paciente);

      if (!result) {
        return res.status(404).json({ success: false, message: "Sin resultados" });
      }

      res.json({ success: true, result });
    } catch (error) {
      console.error("❌ Error en getLastResult:", error);
      res.status(500).json({ success: false });
    }
  },

  getQuestionsByTest: async (req, res) => {
    try {
      const { id_test } = req.params;
      const questions = await Test.getQuestionsByTest(id_test);
      res.json({ success: true, questions });
    } catch (error) {
      console.error("❌ Error en getQuestionsByTest:", error);
      res.status(500).json({ success: false });
    }
  },

  checkAssignedFinalTest: async (req, res) => {
    try {
      const { id_paciente } = req.params;
      const assigned = await Test.checkAssignedFinalTest(id_paciente);
      res.json({ success: true, assigned });
    } catch (error) {
      console.error("❌ Error checkAssignedFinalTest:", error);
      res.status(500).json({ success: false });
    }
  },

// -----------------------------
//   GUARDAR TEST FINAL
// -----------------------------
saveFinalTest: async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id_paciente, answers } = req.body;

    if (!id_paciente || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Datos incompletos"
      });
    }

    // Buscar si ya existe aplicación final tipo=2
    let [existing] = await connection.query(
      `SELECT * FROM aplicacion_test 
       WHERE id_paciente=? AND tipo=2
       ORDER BY fecha DESC
       LIMIT 1`,
      [id_paciente]
    );

    let id_aplicacion;

    if (existing.length > 0) {
      id_aplicacion = existing[0].id_aplicacion;

      // Borrar respuestas previas para volver a guardar
      await connection.query(
        `DELETE FROM respuesta_test WHERE id_aplicacion=?`,
        [id_aplicacion]
      );

    } else {
      // Crear nueva aplicación
      id_aplicacion = await Test.createApplication(2, id_paciente, 2);
    }

    // Guardar nuevas respuestas
    for (const ans of answers) {
      await connection.query(
        `INSERT INTO respuesta_test (id_aplicacion, id_pregunta, respuesta)
         VALUES (?, ?, ?)`,
        [id_aplicacion, ans.id_pregunta, ans.value]
      );
    }

    // SUMAR TODAS las respuestas (1–5)
    const puntaje_total = answers.reduce(
      (sum, a) => sum + Number(a.value),
      0
    );

    const interpretacion =
      puntaje_total >= 76 ? "Duelo severo" :
      puntaje_total >= 46 ? "Duelo moderado" :
      "Duelo leve";

    // Guardar resultado
    await connection.query(
      `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion)
       VALUES (?, ?, ?)`,
      [id_aplicacion, puntaje_total, interpretacion]
    );

    // Marcar como completado
    await connection.query(
      `UPDATE aplicacion_test SET estado='completado' WHERE id_aplicacion=?`,
      [id_aplicacion]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Test final guardado",
      id_aplicacion,
      puntaje_total,
      interpretacion
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error en saveFinalTest:", error);
    res.status(500).json({ success: false, error: "Error guardando test final" });
  }
},

};
