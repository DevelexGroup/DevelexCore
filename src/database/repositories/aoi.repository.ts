import { db } from '../database';
import type { Aoi } from '../models/Aoi';

const aoiRepository = {
  async create(data: Aoi): Promise<number | null> {
    try {
      const id = await db.aois.add({
        ...data,
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<Aoi[] | null> {
    try {
      const aois = await db.aois.where('userId').equals(userId).toArray();

      return aois;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,aoiId,leftBotPos.x,leftBotPos.y,rightTopPos.x,rightTopPos.y';
  },
  async toCsv(data: Aoi[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.aoiId},${x.leftBotPos.x},${x.leftBotPos.y},${x.rightTopPos.x},${x.rightTopPos.y}`).join("\n");
  }
};

export default aoiRepository;