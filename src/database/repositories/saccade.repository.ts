import { db } from '../database';
import type { Saccade } from '../models/Saccade';

const saccadeRepository = {
  async getAll(): Promise<Saccade[]> {
    try {
      const saccades = await db.saccades.toArray();

      return saccades;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Saccade): Promise<number | null> {
    try {
      const id = await db.saccades.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, type, duration, aoi, angleToScreen, angleToPrevious, angleToPreviousInvalidityTime, originFixationX, originFixationY, targetFixationX, targetFixationY';
  },
  toCsv(data: Saccade): string {
    return `${data.sessionId},${data.timestamp},${data.type},${data.duration},${data.aoi},${data.angleToScreen},${data.angleToPrevious},${data.angleToPreviousInvalidityTime},${data.originFixation.x},${data.originFixation.y},${data.targetFixation.x},${data.targetFixation.y}`;
  },
};

export default saccadeRepository;