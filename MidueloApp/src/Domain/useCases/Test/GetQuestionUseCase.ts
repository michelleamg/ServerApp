// Domain/useCases/test/GetQuestionsUseCase.ts
import { TestRepository } from '../../repositories/TestRepository';
import { Question } from '../../entities/Question';

export class GetQuestionsUseCase {
  constructor(private repository: TestRepository) {}

  async execute(): Promise<Question[]> {
    return await this.repository.getQuestions();
  }
}