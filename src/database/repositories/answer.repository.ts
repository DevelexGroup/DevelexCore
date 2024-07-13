import { db } from '../database';
import type { Answer, AnswerReaction } from '../models/Answer';

const answerRepository = {
  async create(data: Answer): Promise<number | null> {
    try {
      const id = await db.answers.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<Answer[] | null> {
    try {
      const answers = await db.answers.where('userId').equals(userId).toArray();

      return answers;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,questionId,answer,timestamp';
  },
  csvReactionHeader(): string {
    return 'id,userId,questionId,answer,reaction,timestamp';
  },
  async toCsv(data: Answer[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.questionId},${x.answer},${x.timestamp}`).join("\n");
  },
  async toCsvReaction(data: AnswerReaction[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.questionId},${x.answer},${x.reaction},${x.timestamp}`).join("\n");
  },
};

export default answerRepository;