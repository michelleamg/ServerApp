import pool from '../db/db.js';

export const Test = {
  createApplication: async (id_test, id_paciente, tipo = 1) => {
      // 1️⃣ Validación: verificar si ya existe test inicial completado
      const [existing] = await pool.execute(
        `SELECT id_aplicacion FROM aplicacion_test 
        WHERE id_paciente = ? AND tipo = 1 AND estado = 'completado'`,
        [id_paciente]
      );

      if (existing.length > 0 && tipo === 1) {
        throw new Error("El paciente ya completó el test inicial.");
      }

      // 2️⃣ Obtener psicólogo asignado
      const [pacienteRows] = await pool.execute(
        'SELECT id_psicologo FROM paciente WHERE id_paciente = ?',
        [id_paciente]
      );

      const id_psicologo = pacienteRows[0]?.id_psicologo || 1;

      // 3️⃣ Crear aplicación
      const [result] = await pool.execute(
        `INSERT INTO aplicacion_test (id_test, id_paciente, id_psicologo, fecha, tipo) 
        VALUES (?, ?, ?, NOW(), ?)`,
        [id_test, id_paciente, id_psicologo, tipo]
      );

      return result.insertId;
    },


  // Guardar respuesta individual
  saveAnswer: async (id_aplicacion, questionId, respuesta) => {
    await pool.execute(
      `INSERT INTO respuesta_test (id_aplicacion, id_pregunta, respuesta)
      VALUES (?, ?, ?)`,
      [id_aplicacion, questionId, respuesta]
    );
  },

  // Guardar resultado final
  saveResult: async (id_aplicacion, puntaje_total, interpretacion) => {
    await pool.execute(
      `INSERT INTO resultado_test (id_aplicacion, puntaje_total, interpretacion) 
       VALUES (?, ?, ?)`,
      [id_aplicacion, puntaje_total, interpretacion]
    );
  },

  // Obtener texto de pregunta por ID
  getQuestionText: (questionId) => {
    const questions = {
      1: "Tras su muerte me costaba relacionarme con algunas personas.",
      2: "Tras su muerte me costaba concentrarme en mi trabajo.",
      3: "Tras su muerte perdí el interés en mi familia, amigos y actividades fuera de casa.",
      4: "Tenía la necesidad de hacer las cosas que él/ella había querido hacer.",
      5: "Después de su muerte estaba más irritable de lo normal.",
      6: "En los tres primeros meses después de su muerte me sentía incapaz de realizar mis actividades habituales.",
      7: "Me sentía furioso/a porque me había abandonado.",
      8: "Tras su muerte me costaba trabajo dormir.",
      9: "Todavía tengo ganas de llorar cuando pienso en él/ella.",
      10: "Todavía me pongo triste cuando pienso en él/ella.",
      11: "No puedo aceptar su muerte.",
      12: "A veces la/le echo mucho de menos.",
      13: "Todavía me resulta doloroso traer a la memoria su recuerdo.",
      14: "A menudo me quedo ensimismado pensando en él/ella.",
      15: "Lloro a escondidas cuando pienso en él/ella.",
      16: "Nadie podrá ocupar jamás el lugar que él/ella ha dejado en mi vida.",
      17: "No puedo dejar de pensar en él/ella.",
      18: "Creo que no es justo que haya muerto.",
      19: "Las personas que me rodean todavía me hacen recordarla/le.",
      20: "Soy incapaz de aceptar su muerte.",
      21: "A veces me invade la necesidad de que él/ella esté conmigo."
    };
    return questions[questionId] || `Pregunta ID: ${questionId}`;
  },

  // Obtener preguntas del test
  getQuestions: () => {
  return [
    // PARTE I (8 ítems)
    { id: 1, section: "initial", text: "Tras su muerte me costaba relacionarme con algunas personas." },
    { id: 2, section: "initial", text: "Tras su muerte me costaba concentrarme en mi trabajo." },
    { id: 3, section: "initial", text: "Tras su muerte perdí el interés en mi familia, amigos y actividades fuera de casa." },
    { id: 4, section: "initial", text: "Tenía la necesidad de hacer las cosas que él/ella había querido hacer." },
    { id: 5, section: "initial", text: "Después de su muerte estaba más irritable de lo normal." },
    { id: 6, section: "initial", text: "En los tres primeros meses después de su muerte me sentía incapaz de realizar mis actividades habituales." },
    { id: 7, section: "initial", text: "Me sentía furioso/a porque me había abandonado." },
    { id: 8, section: "initial", text: "Tras su muerte me costaba trabajo dormir." },

    // PARTE II (13 ítems)
    { id: 9, section: "current", text: "Todavía tengo ganas de llorar cuando pienso en él/ella." },
    { id: 10, section: "current", text: "Todavía me pongo triste cuando pienso en él/ella." },
    { id: 11, section: "current", text: "No puedo aceptar su muerte." },
    { id: 12, section: "current", text: "A veces la/le echo mucho de menos." },
    { id: 13, section: "current", text: "Todavía me resulta doloroso traer a la memoria su recuerdo." },
    { id: 14, section: "current", text: "A menudo me quedo ensimismado pensando en él/ella." },
    { id: 15, section: "current", text: "Lloro a escondidas cuando pienso en él/ella." },
    { id: 16, section: "current", text: "Nadie podrá ocupar jamás el lugar que él/ella ha dejado en mi vida." },
    { id: 17, section: "current", text: "No puedo dejar de pensar en él/ella." },
    { id: 18, section: "current", text: "Creo que no es justo que haya muerto." },
    { id: 19, section: "current", text: "Las personas que me rodean todavía me hacen recordarla/le." },
    { id: 20, section: "current", text: "Soy incapaz de aceptar su muerte." },
    { id: 21, section: "current", text: "A veces me invade la necesidad de que él/ella esté conmigo." }
    ];
  },

      // Método mejorado para TestResult.js
// Reemplaza el método checkIfCompleted existente con este:

    async checkIfCompleted(id_paciente) {
      try {
        const [rows] = await pool.execute(
          `
          SELECT estado, tipo
          FROM aplicacion_test
          WHERE id_paciente = ? 
          AND id_test = 1
          AND tipo = 1
          ORDER BY fecha DESC
          LIMIT 1
          `,
          [id_paciente]
        );

        if (rows.length === 0) {
          return false;
        }

        const estado = rows[0].estado?.toLowerCase() || "";
        return estado === "completado";

      } catch (error) {
        console.error("❌ Error en checkIfCompleted:", error);
        return false;
      }
    },
    // ✅ Obtener el último resultado del test de un paciente
  getAllResults: async (id_paciente) => {
    const [rows] = await pool.execute(
      `
      SELECT 
        r.id_resultado,
        r.puntaje_total,
        r.interpretacion,
        a.id_test,
        a.tipo,
        a.fecha
      FROM resultado_test r
      INNER JOIN aplicacion_test a 
        ON r.id_aplicacion = a.id_aplicacion
      WHERE a.id_paciente = ?
      ORDER BY a.tipo ASC
      `,
      [id_paciente]
    );

    return rows;
  },


  getQuestionsByTest: async (id_test) => {
  const [rows] = await pool.execute(
    `SELECT id_pregunta, numero_pregunta, texto_pregunta, tipo_respuesta
     FROM pregunta_test WHERE id_test = ? ORDER BY numero_pregunta ASC`,
    [id_test]
  );
  return rows;
},
findFinalApplication: async (id_paciente) => {
  const [rows] = await pool.execute(
    `SELECT * FROM aplicacion_test
     WHERE id_paciente = ? AND tipo = 2
     ORDER BY fecha DESC
     LIMIT 1`,
    [id_paciente]
  );
  return rows[0] || null;
}
,

checkAssignedFinalTest: async (id_paciente) => {
  const [rows] = await pool.execute(
    `SELECT * FROM aplicacion_test 
     WHERE id_paciente = ? AND id_test = 2`,
    [id_paciente]
  );

  return rows.length > 0;
},
};
