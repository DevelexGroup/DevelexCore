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
    return 'sessionId, timestamp, type, duration, aoi, x, y, deviceId, fixationId';
  },
  toCsv(data: Fixation): string {
    return `${data.sessionId},${data.timestamp},${data.type},${data.duration},${data.aoi},${data.x},${data.y},${data.deviceId},${data.fixationId}`;
  },
};

export default fixationRepository;