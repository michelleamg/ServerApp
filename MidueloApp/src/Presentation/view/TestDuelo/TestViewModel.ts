import { useState, useEffect } from 'react';
import { TestQuestion, TestAnswer, TestProgress } from '../../../Domain/entities/Test';
import { GetTestQuestionsUseCase } from '../../../Domain/useCases/Test/GetQuestionUseCase';
import { SubmitTestUseCase } from '../../../Domain/useCases/Test/SubmitTestUseCase';

export const useTestViewModel = (
  getTestQuestionsUseCase: GetTestQuestionsUseCase,
  submitTestUseCase: SubmitTestUseCase
) => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentSection, setCurrentSection] = useState<'initial' | 'current'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getTestQuestionsUseCase.execute();
      setQuestions(questionsData);
    } catch (err) {
      setError('Error cargando preguntas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Avanzar automáticamente
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitTest = async (userId: string) => {
    try {
      setLoading(true);
      
      const testAnswers: TestAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
        section: questions.find(q => q.id === parseInt(questionId))?.section || 'initial'
      }));

      const result = await submitTestUseCase.execute(userId, testAnswers);
      return result;
    } catch (err) {
      setError('Error enviando test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestions = () => {
    return questions.filter(q => q.section === currentSection);
  };

  const getProgress = () => {
    const sectionQuestions = getCurrentQuestions();
    const answeredCount = sectionQuestions.filter(q => answers[q.id]).length;
    return (answeredCount / sectionQuestions.length) * 100;
  };

  return {
    questions: getCurrentQuestions(),
    allQuestions: questions,
    currentQuestion,
    answers,
    loading,
    error,
    currentSection,
    submitAnswer,
    goToPrevious,
    submitTest,
    setCurrentQuestion,
    setCurrentSection,
    getProgress
  };
};