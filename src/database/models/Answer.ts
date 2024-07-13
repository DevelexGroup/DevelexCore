export interface Answer {
  id?: number;
  userId: string;
  questionId: number;
  answer: number;
  timestamp: number | null;
};

export interface AnswerReaction extends Answer {
  reaction: number;
};
