import { db } from '../database';
import type { Fixation } from '../models/Fixation';

const fixationRepository = {
  async getAll(): Promise<Fixation[]> {
    try {
      const fixations = await db.fixations.toArray();

      return fixations;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Fixation): Promise<number | null> {
    try {
      const id = await db.fixations.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, type, duration, aoi, gazeData.x, gazeData.y, gazeData.xL, gazeData.yL, gazeData.xR, gazeData.yR, gazeData.fixationId';
  },
  async toCsv(data: Fixation): Promise<string> {
    return `${data.sessionId},${data.timestamp},${data.type},${data.duration},${data.aoi},${data.gazeData.x},${data.gazeData.y},${data.gazeData.xL},${data.gazeData.yL},${data.gazeData.xR},${data.gazeData.yR},${data.gazeData.fixationId}`;
  },
};

export default fixationRepository;