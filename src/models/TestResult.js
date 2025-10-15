import pool from '../db/db.js';

export const Test = {
      createApplication: async (id_test, id_paciente) => {
    // Primero obtener el id_psicologo del paciente
    const [pacienteRows] = await pool.execute(
      'SELECT id_psicologo FROM paciente WHERE id_paciente = ?',
      [id_paciente]
    );
    
    const id_psicologo = pacienteRows[0]?.id_psicologo || 1; // Usar 1 como default si no tiene

    const [result] = await pool.execute(
      `INSERT INTO aplicacion_test (id_test, id_paciente, id_psicologo, fecha) 
       VALUES (?, ?, ?, NOW())`,
      [id_test, id_paciente, id_psicologo]
    );
    return result.insertId;
  },

  // Guardar respuesta individual
  saveAnswer: async (id_aplicacion, pregunta, respuesta) => {
    await pool.execute(
      `INSERT INTO respuesta_test (id_aplicacion, pregunta, respuesta) 
       VALUES (?, ?, ?)`,
      [id_aplicacion, pregunta, respuesta]
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
      9: "Actualmente todavía me cuesta relacionarme con algunas personas.",
      10: "Actualmente me cuesta concentrarme en mi trabajo."
    };
    return questions[questionId] || `Pregunta ID: ${questionId}`;
  },

  // Obtener preguntas del test
  getQuestions: () => {
    return [
      { id: 1, section: "initial", text: "Tras su muerte me costaba relacionarme con algunas personas." },
      { id: 2, section: "initial", text: "Tras su muerte me costaba concentrarme en mi trabajo." },
      { id: 3, section: "initial", text: "Tras su muerte perdí el interés en mi familia, amigos y actividades fuera de casa." },
      { id: 4, section: "initial", text: "Tenía la necesidad de hacer las cosas que él/ella había querido hacer." },
      { id: 5, section: "initial", text: "Después de su muerte estaba más irritable de lo normal." },
      { id: 6, section: "initial", text: "En los tres primeros meses después de su muerte me sentía incapaz de realizar mis actividades habituales." },
      { id: 7, section: "initial", text: "Me sentía furioso/a porque me había abandonado." },
      { id: 8, section: "initial", text: "Tras su muerte me costaba trabajo dormir." },
      { id: 9, section: "current", text: "Actualmente todavía me cuesta relacionarme con algunas personas." },
      { id: 10, section: "current", text: "Actualmente me cuesta concentrarme en mi trabajo." }
    ];
  }
};
