import { db } from '../database';
import type { Intersect } from '../models/Intersect';

const intersectRepository = {
  async getAll(): Promise<Intersect[]> {
    try {
      const intersects = await db.intersects.toArray();

      return intersects;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async getLast(n: number): Promise<Intersect[]> {
    try {
      const intersects = await db.intersects.orderBy('timestamp').reverse().limit(n).toArray();

      return intersects;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Intersect): Promise<number | null> {
    try {
      const id = await db.intersects.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, aoi, gazeData.x, gazeData.y, gazeData.xL, gazeData.yL, gazeData.xR, gazeData.yR, gazeData.fixationId, gazeData.fixationDuration';
  },
  toCsv(data: Intersect): string {
    return `${data.sessionId},${data.timestamp},${data.aoi},${data.gazeData.x},${data.gazeData.y},${data.gazeData.xL},${data.gazeData.yL},${data.gazeData.xR},${data.gazeData.yR},${data.gazeData.fixationId},${data.gazeData.fixationDuration}`;
  },
};

export default intersectRepository;