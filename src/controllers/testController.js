import db from '../db/db.js';
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
    const connection = await db.getConnection();
    
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
      const id_aplicacion = await Test.createApplication(1, userId);
      console.log('✅ Aplicación creada ID:', id_aplicacion);

      // 2. Guardar respuestas
      for (const answer of answers) {
        const preguntaTexto = Test.getQuestionText(answer.questionId);
        await Test.saveAnswer(id_aplicacion, preguntaTexto, answer.value.toString());
      }
      console.log('✅ Respuestas guardadas:', answers.length);

      // 3. Calcular puntaje total y guardar resultado
      const puntajeTotal = Math.round((initialScore + currentScore) / 2);
      await Test.saveResult(id_aplicacion, puntajeTotal, griefType);
      console.log('✅ Resultado guardado - Puntaje:', puntajeTotal);

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
      console.error('❌ Error en saveResults:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        detalle: error.message 
      });
    } finally {
      connection.release();
    }
  },

  // Obtener historial de tests
  getHistory: async (req, res) => {
    try {
      const { id_paciente } = req.params;
      console.log('📊 Solicitando historial para paciente:', id_paciente);
      
      // Aquí puedes implementar la consulta del historial
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
  }
};

