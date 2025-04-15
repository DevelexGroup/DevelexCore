import { db } from '../database';
import type { Dwell } from '../models/Dwell';

const dwellRepository = {
  async getAll(): Promise<Dwell[]> {
    try {
      const dwells = await db.dwells.toArray();

      return dwells;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Dwell): Promise<number | null> {
    try {
      const id = await db.dwells.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, type, duration, aoi, gazeData.x, gazeData.y, gazeData.xL, gazeData.yL, gazeData.xR, gazeData.yR';
  },
  toCsv(data: Dwell): string {
    return `${data.sessionId},${data.timestamp},${data.type},${data.duration},${data.aoi},${data.gazeData.x},${data.gazeData.y},${data.gazeData.xL},${data.gazeData.yL},${data.gazeData.xR},${data.gazeData.yR}`;
  },
};

export default dwellRepository;