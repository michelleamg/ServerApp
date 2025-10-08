export interface TestQuestion {
  id: number;
  text: string;
  section: 'initial' | 'current';
}

export interface TestAnswer {
  questionId: number;
  value: number; // 1-5
  section: 'initial' | 'current';
}

export interface TestResult {
  id?: string;
  userId: string;
  answers: TestAnswer[];
  initialScore: number;
  currentScore: number;
  griefType: 'resolved' | 'prolonged' | 'delayed' | 'absent';
  createdAt: Date;
}

export interface TestProgress {
  currentQuestion: number;
  answers: Record<number, number>;
  section: 'initial' | 'current';
}