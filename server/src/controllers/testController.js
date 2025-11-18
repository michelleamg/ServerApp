import pool from '../db/db.js';
import { Test } from '../models/TestResult.js';

export const testController = {
  // Obtener preguntas del test
  getQuestions: async (req, res) => {
    try {
      console.log('📋 Solicitando preguntas del test');
      const questions = Test.getQuestions();
      
      res.json({ 
        success: true,
        questions 
      });
      
    } catch (error) {
      console.error('❌ Error en getQuestions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener preguntas' 
      });
    }
  },

  // Guardar resultados del test
  saveResults: async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { 
        userId,           // id_paciente
        answers,          // respuestas
        initialScore, 
        currentScore, 
        griefType         // interpretación
      } = req.body;

      console.log('💾 Guardando resultados para usuario:', userId);

      // Validaciones
      if (!userId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ 
          success: false,
          error: 'Datos incompletos: userId y answers son requeridos' 
        });
      }
      

      // 1. Crear aplicación de test
      const id_aplicacion = await Test.createApplication(1, userId,1);
      console.log('✅ Aplicación creada ID:', id_aplicacion);

      // 2. Guardar respuestas
      // 2. Guardar respuestas
      for (const answer of answers) {
        await Test.saveAnswer(
          id_aplicacion,
          answer.questionId,
          answer.value.toString()
        );
      }
      console.log('✅ Respuestas guardadas para aplicación ID:', id_aplicacion);

      // 3. Calcular puntaje total y guardar resultado
      const puntajeTotal = Math.round((initialScore + currentScore) / 2);
      await Test.saveResult(id_aplicacion, puntajeTotal, griefType);
      console.log('✅ Resultado guardado - Puntaje:', puntajeTotal);

      // 🟢 Nuevo paso: actualizar estado a 'completado'
      await pool.execute(
        "UPDATE aplicacion_test SET estado = 'completado' WHERE id_aplicacion = ?",
        [id_aplicacion]
      );
      console.log("🟢 Estado actualizado a 'completado' para:", id_aplicacion);
      await connection.commit();
      
      res.json({ 
        success: true, 
        id_aplicacion,
        message: 'Test guardado exitosamente',
        data: {
          pacienteId: userId,
          respuestasGuardadas: answers.length,
          puntajeTotal,
          tipoDuelo: griefType
        }
      });
     } catch (error) {
      await connection.rollback();

      if (error.message.includes("ya completó el test inicial")) {
        return res.status(400).json({
          success: false,
          error: "El paciente ya completó el test inicial y no puede repetirlo."
        });
      }

      console.error('❌ Error en saveResults:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },

  // Obtener historial de tests
  getHistory: async (req, res) => {
    try {
      const { id_paciente } = req.params;
      console.log('📊 Solicitando historial para paciente:', id_paciente);
    
      res.json({ 
        success: true,
        message: 'Historial obtenido',
        pacienteId: id_paciente
      });
      
    } catch (error) {
      console.error('❌ Error en getHistory:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener historial' 
      });
    }
  },

    getCompletedTest: async (req, res) => {
    const { id_paciente } = req.params;

    try {
      console.log("🔍 Verificando test completado para paciente:", id_paciente);

      const hasCompletedTest = await Test.checkIfCompleted(id_paciente);

      res.json({ hasCompletedTest}); // true o false
    } catch (error) {
      console.error("❌ Error en getCompletedTest:", error);
      res.status(500).json({ hasCompletedTest: false });
    }
  },
    // ✅ Obtener el último resultado del test
    getLastResult: async (req, res) => {
      const { id_paciente } = req.params;

      try {
        console.log("📊 Consultando último resultado para paciente:", id_paciente);

        const result = await Test.getLastResult(id_paciente);

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "No se encontraron resultados para este paciente.",
          });
        }

        res.json({
          success: true,
          result,
        });
      } catch (error) {
        console.error("❌ Error en getLastResult:", error);
        res.status(500).json({
          success: false,
          error: "Error al obtener el resultado del test.",
        });
      }
    },


};

