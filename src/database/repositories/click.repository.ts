import { db } from '../database';
import type { Click } from '../models/Click';

const clickRepository = {
  async create(data: Click): Promise<number | null> {
    try {
      const id = await db.clicks.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async readMany(userId: string): Promise<Click[] | null> {
    try {
      const clicks = await db.clicks.where('userId').equals(userId).toArray();

      return clicks;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async read(userId: string, aoiId: string): Promise<Click | null> {
    try {
      const click = await db.clicks.where('userId').equals(userId).and((click) => click.aoiId === aoiId).last();

      return click ?? null;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,userId,aoiId,x,y,value,timestamp';
  },
  async toCsv(data: Click[]): Promise<string> {
    return data.map(x => `${x.id},${x.userId},${x.aoiId},${x.x},${x.y},${x.value},${x.timestamp}`).join("\n");
  },
};

export default clickRepository;