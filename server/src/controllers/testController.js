import pool from '../db/db.js';
import { Test } from '../models/TestResult.js';

export const testController = {

  // Obtener preguntas
  getQuestions: async (req, res) => {
  try {
    const questions = Test.getQuestions();
    res.json({ 
      success: true, 
      questions,
      informacion: {
        nombre: "Inventario Texas Revisado de Duelo (ITRD)",
        partes: {
          parte1: {
            nombre: "Comportamiento en el Pasado (Duelo Agudo)",
            items: 8,
            puntuacionMaxima: 40,
            descripcion: "Evalúa la conducta y los sentimientos del doliente en los momentos inmediatos al fallecimiento"
          },
          parte2: {
            nombre: "Sentimientos Actuales (Duelo Actual)", 
            items: 13,
            puntuacionMaxima: 65,
            descripcion: "Evalúa los sentimientos actuales del doliente en relación con el fallecido"
          }
        },
        puntuacionTotalMaxima: 105,
        escala: "Likert de 5 puntos (1: Completamente falsa - 5: Completamente verdadera)"
      }
    });
  } catch (error) {
    console.error("❌ Error en getQuestions:", error);
    res.status(500).json({ success: false, error: "Error al obtener preguntas" });
  }
},

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

    // Separar respuestas por parte
    const respuestasParte1 = answers.filter(a => a.questionId <= 8);
    const respuestasParte2 = answers.filter(a => a.questionId > 8 && a.questionId <= 21);

    // Verificar que se respondieron todas las preguntas
    if (respuestasParte1.length !== 8 || respuestasParte2.length !== 13) {
      return res.status(400).json({
        success: false,
        error: "Debe responder todas las 21 preguntas del inventario"
      });
    }

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

    // ✅ CALCULAR PUNTAJES SEGÚN ITRD
    const puntajeParte1 = respuestasParte1.reduce((sum, ans) => sum + Number(ans.value), 0);
    const puntajeParte2 = respuestasParte2.reduce((sum, ans) => sum + Number(ans.value), 0);
    const puntajeTotal = puntajeParte1 + puntajeParte2;

    // ✅ PUNTOS DE CORTE SEGÚN ITRD (Percentil 50 - Referencia estudios)
    const PUNTUACION_ALTA_PARTE1 = 16; // P50 Duelo Agudo
    const PUNTUACION_ALTA_PARTE2 = 32; // P50 Duelo Actual

    // ✅ CLASIFICACIÓN PROFESIONAL SEGÚN FASCHINGBAUER
    const esAltaParte1 = puntajeParte1 >= PUNTUACION_ALTA_PARTE1;
    const esAltaParte2 = puntajeParte2 >= PUNTUACION_ALTA_PARTE2;

    let tipoDuelo, interpretacion, riesgoComplicado;

    if (esAltaParte1 && esAltaParte2) {
      tipoDuelo = "Duelo Prolongado Complejo";
      interpretacion = "Respuesta inicial intensa y sentimientos persistentes. Alto riesgo de complicaciones.";
      riesgoComplicado = "Alto";
    } else if (!esAltaParte1 && !esAltaParte2) {
      tipoDuelo = "Duelo Normativo";
      interpretacion = "Proceso de adaptación dentro de parámetros esperados.";
      riesgoComplicado = "Bajo";
    } else if (esAltaParte1 && !esAltaParte2) {
      tipoDuelo = "Duelo Agudo Resuelto";
      interpretacion = "Reacción inicial intensa con adaptación posterior satisfactoria.";
      riesgoComplicado = "Bajo-Moderado";
    } else { // !esAltaParte1 && esAltaParte2
      tipoDuelo = "Duelo Prolongado";
      interpretacion = "Reacción inicial reprimida con manifestación tardía del dolor.";
      riesgoComplicado = "Moderado-Alto";
    }

    // ✅ GUARDAR RESULTADOS EN LA BD - CORREGIDO
    await connection.query(
      `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion, tipo_resultado, tipo_duelo, riesgo_complicado)
       VALUES (?, ?, ?, 'parte1', ?, ?), 
              (?, ?, ?, 'parte2', ?, ?), 
              (?, ?, ?, 'general', ?, ?)`,
      [
        // Parte I - Interpretación con puntaje
        id_aplicacion, puntajeParte1, `Duelo Agudo: ${puntajeParte1}/40 puntos`, 
        tipoDuelo, riesgoComplicado,
        
        // Parte II - Interpretación con puntaje  
        id_aplicacion, puntajeParte2, `Duelo Actual: ${puntajeParte2}/65 puntos`,
        tipoDuelo, riesgoComplicado,
        
        // General - Interpretación con tipo de duelo y explicación
        id_aplicacion, puntajeTotal, `${tipoDuelo}: ${interpretacion}`,
        tipoDuelo, riesgoComplicado
      ]
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
      message: "Inventario Texas de Duelo Revisado completado exitosamente",
      resultados: {
        parte1: { 
          puntaje: puntajeParte1, 
          maximo: 40,
          interpretacion: `Duelo Agudo: ${puntajeParte1}/40 puntos`,
          nivel: esAltaParte1 ? "Alto" : "Bajo"
        },
        parte2: { 
          puntaje: puntajeParte2, 
          maximo: 65,
          interpretacion: `Duelo Actual: ${puntajeParte2}/65 puntos`, 
          nivel: esAltaParte2 ? "Alto" : "Bajo"
        },
        general: { 
          puntaje: puntajeTotal, 
          maximo: 105,
          tipoDuelo: tipoDuelo,
          interpretacion: interpretacion,
          riesgoComplicado: riesgoComplicado
        },
        clasificacion: {
          parte1Alta: esAltaParte1,
          parte2Alta: esAltaParte2,
          puntosCorte: {
            parte1: PUNTUACION_ALTA_PARTE1,
            parte2: PUNTUACION_ALTA_PARTE2
          }
        }
      }
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
    const result = await Test.getAllResults(id_paciente);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "Sin resultados" });
    }

    // ✅ DEVOLVER TODOS los resultados, no solo los generales
    res.json({ success: true, result: result });
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

    // SUMAR TODAS las respuestas (1-5)
    const puntaje_total = answers.reduce(
      (sum, a) => sum + Number(a.value),
      0
    );

    // ✅ CLASIFICACIÓN PROFESIONAL PARA TEST FINAL
    let tipoDuelo, interpretacion, riesgoComplicado;

    if (puntaje_total >= 76) {
      tipoDuelo = "Duelo Prolongado Complejo";
      interpretacion = "Presencia de síntomas intensos y persistentes que requieren intervención profesional.";
      riesgoComplicado = "Alto";
    } else if (puntaje_total >= 46) {
      tipoDuelo = "Duelo Prolongado";
      interpretacion = "Proceso de duelo extendido en el tiempo con dificultades de adaptación.";
      riesgoComplicado = "Moderado";
    } else {
      tipoDuelo = "Duelo Normativo";
      interpretacion = "Proceso de adaptación dentro de los parámetros esperados.";
      riesgoComplicado = "Bajo";
    }

    // ✅ GUARDAR RESULTADO CON TIPO DE DUELO EN INTERPRETACION
    await connection.query(
      `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion, tipo_duelo, riesgo_complicado)
       VALUES (?, ?, ?, ?, ?)`,
      [id_aplicacion, puntaje_total, `${tipoDuelo}: ${interpretacion}`, tipoDuelo, riesgoComplicado]
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
      resultados: {
        puntaje_total,
        tipoDuelo,
        interpretacion,
        riesgoComplicado
      }
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error en saveFinalTest:", error);
    res.status(500).json({ success: false, error: "Error guardando test final" });
  }
},
};
