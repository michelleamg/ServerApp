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
    const { userId, answers } = req.body;
    
    if (!id_aplicacion || !userId || !answers) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers debe ser un array' });
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({ 
        message: `Se esperan ${questions.length} respuestas, recibidas: ${answers.length}` 
      });
    }

    // Convertir respuestas del frontend al formato del backend
    const respuestaObjects = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return {
        pregunta: question ? question.text : `Pregunta ${answer.questionId}`,
        respuesta: answer.value.toString()
      };
    });

    // Calcular puntajes por sección
    const initialAnswers = answers.filter(a => {
      const question = questions.find(q => q.id === a.questionId);
      return question && question.section === 'initial';
    });
    
    const currentAnswers = answers.filter(a => {
      const question = questions.find(q => q.id === a.questionId);
      return question && question.section === 'current';
    });

    const initialScore = initialAnswers.length > 0 
      ? initialAnswers.reduce((sum, a) => sum + a.value, 0) / initialAnswers.length 
      : 0;
    
    const currentScore = currentAnswers.length > 0 
      ? currentAnswers.reduce((sum, a) => sum + a.value, 0) / currentAnswers.length 
      : 0;

    // Determinar tipo de duelo
    let griefType;
    if (initialScore >= 3.5 && currentScore <= 2.5) {
      griefType = 'resolved';
    } else if (initialScore >= 3.5 && currentScore >= 3.5) {
      griefType = 'prolonged';
    } else if (initialScore <= 2.5 && currentScore >= 3.5) {
      griefType = 'delayed';
    } else {
      griefType = 'absent';
    }

    const total = answers.reduce((acc, a) => acc + a.value, 0);
    
    await TestModel.saveResponses(id_aplicacion, respuestaObjects);
    await TestModel.saveResult(id_aplicacion, total, griefType);
    
    res.json({ 
      total, 
      griefType,
      initialScore: parseFloat(initialScore.toFixed(2)),
      currentScore: parseFloat(currentScore.toFixed(2)),
      message: "Test completado exitosamente"
    });
    
  } catch (error) {
    console.error('Error al enviar respuestas:', error);
    res.status(500).json({ message: 'Error al procesar el test', error: error.message });
  }
}
