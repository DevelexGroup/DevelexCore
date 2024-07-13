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
    return 'sessionId, timestamp, type, duration, aoi, angleToScreen, angleToPrevious, angleToPreviousInvalidityTime, gazeData.x, gazeData.y, gazeData.xL, gazeData.yL, gazeData.xR, gazeData.yR, gazeData.fixationId, gazeData.fixationDuration, originGazeData.x, originGazeData.y, originGazeData.xL, originGazeData.yL, originGazeData.xR, originGazeData.yR, originGazeData.fixationId, originGazeData.fixationDuration';
  },
  async toCsv(data: Saccade): Promise<string> {
    return `${data.sessionId},${data.timestamp},${data.type},${data.duration},${data.aoi},${data.angleToScreen},${data.angleToPrevious},${data.angleToPreviousInvalidityTime},${data.gazeData.x},${data.gazeData.y},${data.gazeData.xL},${data.gazeData.yL},${data.gazeData.xR},${data.gazeData.yR},${data.gazeData.fixationId},${data.gazeData.fixationDuration},${data.originGazeData.x},${data.originGazeData.y},${data.originGazeData.xL},${data.originGazeData.yL},${data.originGazeData.xR},${data.originGazeData.yR},${data.originGazeData.fixationId},${data.originGazeData.fixationDuration}`;
  },
};

export default saccadeRepository;