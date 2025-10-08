import { TestRepository } from '../../repositories/TestRepository';
import { TestQuestion } from '../../entities/Test';

export class GetTestQuestionsUseCase {
  constructor(private testRepository: TestRepository) {}

  async execute(): Promise<TestQuestion[]> {
    const questions = await this.testRepository.getTestQuestions();
    return questions.map((q: any) => ({
      id: q.id,
      text: q.text,
      section: q.section
    }));
  }
}