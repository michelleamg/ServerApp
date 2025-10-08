import { TestRepository } from '../../Domain/repositories/TestRepository';
import { TestResult } from '../../Domain/entities/Test';
import { TestDataSource } from '../sources/TestDataSource';

export class TestRepositoryImpl implements TestRepository {
  private testDataSource: TestDataSource;

  constructor(testDataSource: TestDataSource) {
    this.testDataSource = testDataSource;
  }

  async saveTestResults(results: TestResult): Promise<TestResult> {
    return await this.testDataSource.saveResults(results);
  }

  async getTestResults(userId: string): Promise<TestResult[]> {
    return await this.testDataSource.getUserResults(userId);
  }

  async getTestQuestions(): Promise<any[]> {
    return await this.testDataSource.getQuestions();
  }
}
