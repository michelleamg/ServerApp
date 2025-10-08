import { TestResult } from '../../Domain/entities/Test';

export interface TestDataSource {
  saveResults(results: TestResult): Promise<TestResult>;
  getUserResults(userId: string): Promise<TestResult[]>;
  getQuestions(): Promise<any[]>;
}