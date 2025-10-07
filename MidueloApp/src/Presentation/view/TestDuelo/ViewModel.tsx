// Presentation/view/test/TestViewModel.tsx
import { useState, useEffect } from "react";
// Update the import path below to the correct location of GetQuestionsUseCase, for example:
import { GetQuestionsUseCase } from "../../../Domain/useCases/Test/GetQuestionUseCase";
// If the file is named differently or in a different folder, adjust the path accordingly.
import { SubmitTestUseCase } from "../../../Domain/useCases/Test/SubmitTestUseCase";
import { TestRepositoryImpl } from "../../../Data/repositories/TestRepositoryImpl";
import { Question, Answer, TestSubmission } from "../../../Domain/entities/Question";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TestViewModel = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const repository = new TestRepositoryImpl();
  const getQuestionsUseCase = new GetQuestionsUseCase(repository);
  const submitTestUseCase = new SubmitTestUseCase(repository);

  // Cargar preguntas al iniciar
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getQuestionsUseCase.execute();
      setQuestions(questionsData);
    } catch (err) {
      setError("Error al cargar las preguntas");
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener preguntas de la parte actual
  const getCurrentPartQuestions = (): Question[] => {
    return questions.filter(q => q.part === currentPart);
  };

  const getCurrentQuestion = (): Question | null => {
    const partQuestions = getCurrentPartQuestions();
    return partQuestions[currentQuestionIndex] || null;
  };

  const saveAnswer = (questionId: number, value: number) => {
    const newAnswer: Answer = {
      questionId,
      value,
      part: currentPart
    };

    // Actualizar o agregar respuesta
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setAnswers(updatedAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  const goToNextQuestion = () => {
    const partQuestions = getCurrentPartQuestions();
    if (currentQuestionIndex < partQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentPart === 1) {
      // Cambiar a parte 2
      setCurrentPart(2);
      setCurrentQuestionIndex(0);
    }
    // Si es la última pregunta de la parte 2, se envía el test
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentPart === 2) {
      // Volver a parte 1
      setCurrentPart(1);
      const part1Questions = questions.filter(q => q.part === 1);
      setCurrentQuestionIndex(part1Questions.length - 1);
    }
  };

  const submitTest = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const id_paciente = await AsyncStorage.getItem("id_paciente");
      
      if (!id_paciente) {
        setError("No se encontró la sesión del usuario");
        return false;
      }

      const submission: TestSubmission = {
        id_paciente: parseInt(id_paciente),
        answers,
        completedAt: new Date()
      };

      const result = await submitTestUseCase.execute(submission);
      
      // Guardar resultado en AsyncStorage
      await AsyncStorage.setItem('lastTestResult', JSON.stringify(result));
      
      return true;
    } catch (err) {
      setError("Error al enviar el test");
      console.error("Error submitting test:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isTestCompleted = (): boolean => {
    const part1Questions = questions.filter(q => q.part === 1);
    const part2Questions = questions.filter(q => q.part === 2);
    
    const part1Answers = answers.filter(a => a.part === 1);
    const part2Answers = answers.filter(a => a.part === 2);
    
    return part1Answers.length === part1Questions.length && 
           part2Answers.length === part2Questions.length;
  };

  const getProgress = (): number => {
    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  return {
    questions,
    currentPart,
    currentQuestionIndex,
    answers,
    loading,
    error,
    getCurrentQuestion,
    saveAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitTest,
    isTestCompleted,
    getProgress,
    getCurrentPartQuestions,
  };
};

export default TestViewModel;