import { TestRepository } from '../../repositories/TestRepository';
import { TestResult, TestAnswer } from '../../entities/Test';

export class SubmitTestUseCase {
  constructor(private testRepository: TestRepository) {}

  async execute(userId: string, answers: TestAnswer[]): Promise<TestResult> {
    const { initialScore, currentScore, griefType } = this.calculateScores(answers);
    
    const testResult: TestResult = {
      userId,
      answers,
      initialScore,
      currentScore,
      griefType,
      createdAt: new Date()
    };

    return await this.testRepository.saveTestResults(testResult);
  }

  private calculateScores(answers: TestAnswer[]): { 
    initialScore: number; 
    currentScore: number; 
    griefType: 'resolved' | 'prolonged' | 'delayed' | 'absent' 
  } {
    const initialAnswers = answers.filter(a => a.section === 'initial');
    const currentAnswers = answers.filter(a => a.section === 'current');

    const initialScore = initialAnswers.reduce((sum, a) => sum + a.value, 0) / initialAnswers.length;
    const currentScore = currentAnswers.reduce((sum, a) => sum + a.value, 0) / currentAnswers.length;

    let griefType: 'resolved' | 'prolonged' | 'delayed' | 'absent';
    
    if (initialScore >= 3.5 && currentScore <= 2.5) {
      griefType = 'resolved';
    } else if (initialScore >= 3.5 && currentScore >= 3.5) {
      griefType = 'prolonged';
    } else if (initialScore <= 2.5 && currentScore >= 3.5) {
      griefType = 'delayed';
    } else {
      griefType = 'absent';
    }

    return { initialScore, currentScore, griefType };
  }
}