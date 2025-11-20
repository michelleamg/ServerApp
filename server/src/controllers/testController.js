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
  saveResults: async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { userId, answers, initialScore, currentScore, griefType } = req.body;

      if (!userId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: "Datos incompletos"
        });
      }

      // Crear aplicación del test inicial
      const id_aplicacion = await Test.createApplication(1, userId, 1);

      // Guardar respuestas
      for (const ans of answers) {
        await connection.query(
          `INSERT INTO respuesta_test (id_aplicacion, id_pregunta, pregunta, respuesta)
           VALUES (?, ?, ?, ?)`,
          [
            id_aplicacion,
            ans.questionId,
            Test.getQuestionText(ans.questionId),
            ans.value.toString()
          ]
        );
      }

      // Puntaje final
      const puntajeTotal = Math.round((initialScore + currentScore) / 2);

      await connection.query(
        `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion)
         VALUES (?, ?, ?)`,
        [id_aplicacion, puntajeTotal, griefType]
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
        id_aplicacion,
        data: { puntajeTotal, griefType }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("❌ Error en saveResults:", error);

      if (error.message.includes("ya completó el test inicial")) {
        return res.status(400).json({
          success: false,
          error: "El paciente ya completó el test inicial"
        });
      }

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

      if (!id_paciente || !answers) {
        return res.status(400).json({
          success: false,
          error: "id_paciente y answers requeridos"
        });
      }

      // Crear aplicación del test final
      const id_aplicacion = await Test.createApplication(2, id_paciente, 2);

      // Guardar respuestas
      for (const ans of answers) {
        await connection.query(
          `INSERT INTO respuesta_test (id_aplicacion, id_pregunta, respuesta)
           VALUES (?, ?, ?)`,
          [id_aplicacion, ans.id_pregunta, ans.value.toString()]
        );
      }

      // Guardar resultado básico
      await connection.query(
        `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion)
         VALUES (?, ?, ?)`,
        [id_aplicacion]
      );

      // Completar
      await connection.query(
        `UPDATE aplicacion_test SET estado='completado' WHERE id_aplicacion=?`,
        [id_aplicacion]
      );

      await connection.commit();
      connection.release();

      res.json({ success: true, message: "Test final guardado", id_aplicacion });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("❌ Error en saveFinalTest:", error);
      res.status(500).json({ success: false, error: "Error guardando test final" });
    }
  },

};
