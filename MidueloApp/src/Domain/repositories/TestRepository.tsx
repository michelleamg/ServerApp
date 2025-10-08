import { TestResult, TestAnswer } from '../entities/Test';

export interface TestRepository {
  saveTestResults(results: TestResult): Promise<TestResult>;
  getTestResults(userId: string): Promise<TestResult[]>;
  getTestQuestions(): Promise<any[]>;
}