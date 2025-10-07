// Domain/repositories/TestRepository.ts
import { Question, TestSubmission, TestResult } from '../entities/Question';

export interface TestRepository {
  getQuestions(): Promise<Question[]>;
  submitTest(submission: TestSubmission): Promise<TestResult>;
  getTestHistory(id_paciente: number): Promise<TestSubmission[]>;
}