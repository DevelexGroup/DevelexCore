import { db } from '../database';
import type { Validation } from '../models/Validation';

const validationRepository = {
  async getAll(): Promise<Validation[]> {
    try {
      const validations = await db.validations.toArray();

      return validations;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: Validation): Promise<number | null> {
    try {
      const id = await db.validations.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async createMany(data: Validation[]): Promise<number[] | null> {
    try {
      const ids = await db.validations.bulkAdd(data, { allKeys: true });
      return ids;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  csvHeader(): string {
    return 'sessionId, timestamp, type, isValid, allDataPointsCount, validDataPointsCount, validDataPointsPercentage, accuracy, precision';
  },
  toCsv(data: Validation): string {
    return `${data.sessionId},${data.timestamp},${data.type},${data.isValid},${data.allDataPointsCount},${data.validDataPointsCount},${data.validDataPointsPercentage},${data.accuracy},${data.precision}`;
  }
};

export default validationRepository;