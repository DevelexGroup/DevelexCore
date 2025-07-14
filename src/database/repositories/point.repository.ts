import { db } from '../database';
import type { Point } from '../models/Point';

const pointRepository = {
  async getAll(): Promise<Point[]> {
    try {
      const points = await db.points.toArray();

      return points;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async getLast(number: number): Promise<Point[]> {
    try {
      const points = await db.points.orderBy('timestamp').reverse().limit(number).toArray();
      return points;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async create(data: Point): Promise<number | null> {
    try {
      const id = await db.points.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async createMany(data: Point[]): Promise<number[] | null> {
    try {
      const ids = await db.points.bulkAdd(data, { allKeys: true });
      return ids;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, x, xL, xR, xLScreenRelative, xRScreenRelative, y, yL, yR, yLScreenRelative, yRScreenRelative, validityL, validityR, parseValidity';
  },
  toCsv(data: Point): string {
    return `${data.sessionId},${data.timestamp},${data.x},${data.xL},${data.xR},${data.xLScreenRelative},${data.xRScreenRelative},${data.y},${data.yL},${data.yR},${data.yLScreenRelative},${data.yRScreenRelative},${data.validityL},${data.validityR},${data.parseValidity}`;
  },
};

export default pointRepository;