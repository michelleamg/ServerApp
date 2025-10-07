// Data/repositories/TestRepositoryImpl.ts
import { TestRepository } from '../../Domain/repositories/TestRepository';
import { Question, TestSubmission, TestResult } from '../../Domain/entities/Question';
import { API_Miduelo } from '../sources/remote/api/ApiMiduelo';
import { AxiosError } from 'axios';

export class TestRepositoryImpl implements TestRepository {
  
  async getQuestions(): Promise<Question[]> {
    try {
      const response = await API_Miduelo.get<Question[]>('/test/questions');
      return response.data;
    } catch (error) {
      const e = (error as AxiosError);
      console.log("❌ Error getting questions:", e.response?.data || e.message);
      throw error;
    }
  }

  async submitTest(submission: TestSubmission): Promise<TestResult> {
    try {
      const response = await API_Miduelo.post<TestResult>('/test/submit', submission);
      return response.data;
    } catch (error) {
      const e = (error as AxiosError);
      console.log("❌ Error submitting test:", e.response?.data || e.message);
      throw error;
    }
  }

  async getTestHistory(id_paciente: number): Promise<TestSubmission[]> {
    try {
      const response = await API_Miduelo.get<TestSubmission[]>(`/test/history/${id_paciente}`);
      return response.data;
    } catch (error) {
      const e = (error as AxiosError);
      console.log("❌ Error getting test history:", e.response?.data || e.message);
      throw error;
    }
  }
}