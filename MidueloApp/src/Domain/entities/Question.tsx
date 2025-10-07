// Domain/entities/Question.ts
export interface Question {
  id: number;
  text: string;
  part: 1 | 2;
  options: Option[];
}

export interface Option {
  value: number;
  label: string;
}

export interface Answer {
  questionId: number;
  value: number;
  part: 1 | 2;
}

export interface TestSubmission {
  id_paciente: number;
  answers: Answer[];
  completedAt: Date;
}

export interface TestResult {
  scorePart1: number;
  scorePart2: number;
  interpretation: string;
  recommendation: string;
}