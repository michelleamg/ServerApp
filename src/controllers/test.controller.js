// src/controllers/test.controller.js
// Define la lógica para iniciar una aplicación de test, obtener
// preguntas y procesar respuestas, almacenando la información en la
// base de datos.

import { TestModel } from '../models/testModel.js';
import { questions } from '../models/questions.js';

export function listQuestions(req, res) {
  res.json({ questions });
}

export async function startTest(req, res) {
  try {
    const { id_test, id_paciente, id_psicologo } = req.body;
    if (!id_test || !id_paciente || !id_psicologo) {
      return res.status(400).json({ message: 'Faltan parámetros para iniciar el test' });
    }
    const id_aplicacion = await TestModel.createApplication(id_test, id_paciente, id_psicologo);
    res.status(201).json({ id_aplicacion });
  } catch (error) {
    console.error('Error al iniciar test:', error);
    res.status(500).json({ message: 'Error al iniciar el test', error: error.message });
  }
}

export async function submitTest(req, res) {
  try {
    const { id_aplicacion } = req.params;
    const { respuestas } = req.body;
    if (!id_aplicacion) {
      return res.status(400).json({ message: 'Falta el id de la aplicación' });
    }
    if (!Array.isArray(respuestas)) {
      return res.status(400).json({ message: 'El cuerpo debe contener un arreglo de respuestas' });
    }
    if (respuestas.length !== questions.length) {
      return res.status(400).json({ message: `Se esperan ${questions.length} respuestas` });
    }
    const respuestaObjects = questions.map((q, idx) => ({ pregunta: q.text, respuesta: respuestas[idx] }));
    const total = respuestas.reduce((acc, val) => acc + Number(val), 0);
    let interpretacion;
    if (total <= 24) interpretacion = 'Duelo normal';
    else if (total <= 42) interpretacion = 'Riesgo moderado';
    else interpretacion = 'Duelo complicado';
    await TestModel.saveResponses(id_aplicacion, respuestaObjects);
    await TestModel.saveResult(id_aplicacion, total, interpretacion);
    res.json({ total, interpretacion });
  } catch (error) {
    console.error('Error al enviar respuestas:', error);
    res.status(500).json({ message: 'Error al procesar el test', error: error.message });
  }
}