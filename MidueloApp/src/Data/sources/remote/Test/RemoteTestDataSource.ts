import { TestDataSource } from '../../TestDataSource';
import { TestResult, TestAnswer } from '../../../../Domain/entities/Test';

export class RemoteTestDataSource implements TestDataSource {
  private baseURL = 'http://localhost:3000/api';

  async saveResults(results: TestResult): Promise<TestResult> {
    const response = await fetch(`${this.baseURL}/tests/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results),
    });

    if (!response.ok) {
      throw new Error('Error guardando resultados');
    }

    return await response.json();
  }

  async getUserResults(userId: string): Promise<TestResult[]> {
    const response = await fetch(`${this.baseURL}/tests/results/${userId}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo resultados');
    }

    return await response.json();
  }

  async getQuestions(): Promise<any[]> {
    // Datos locales como fallback
    const localQuestions = [
      // Parte inicial (8 preguntas)
      { id: 1, text: "Tras su muerte me costaba relacionarme con algunas personas.", section: 'initial' },
      { id: 2, text: "Tras su muerte me costaba concentrarme en mi trabajo.", section: 'initial' },
      { id: 3, text: "Tras su muerte perdí el interés en mi familia, amigos y actividades fuera de casa.", section: 'initial' },
      { id: 4, text: "Tenía la necesidad de hacer las cosas que él/ella había querido hacer.", section: 'initial' },
      { id: 5, text: "Después de su muerte estaba más irritable de lo normal.", section: 'initial' },
      { id: 6, text: "En los tres primeros meses después de su muerte me sentía incapaz de realizar mis actividades habituales.", section: 'initial' },
      { id: 7, text: "Me sentía furioso/a porque me había abandonado.", section: 'initial' },
      { id: 8, text: "Tras su muerte me costaba trabajo dormir.", section: 'initial' },
      
      // Parte actual (13 preguntas - ejemplo)
      { id: 9, text: "Actualmente todavía me cuesta relacionarme con algunas personas.", section: 'current' },
      { id: 10, text: "Actualmente me cuesta concentrarme en mi trabajo.", section: 'current' },
      // ... agregar más preguntas según necesites
    ];

    try {
      const response = await fetch(`${this.baseURL}/tests/questions`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Usando preguntas locales:', error);
    }

    return localQuestions;
  }
}