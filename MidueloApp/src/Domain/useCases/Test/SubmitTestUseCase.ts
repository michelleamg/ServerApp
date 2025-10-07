// Domain/useCases/test/SubmitTestUseCase.ts
import { TestRepository } from '../../repositories/TestRepository';
import { TestSubmission, TestResult } from '../../entities/Question';

export class SubmitTestUseCase {
  constructor(private repository: TestRepository) {}

  async execute(submission: TestSubmission): Promise<TestResult> {
    return await this.repository.submitTest(submission);
  }
}