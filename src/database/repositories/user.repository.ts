import { db } from '../database';
import type { User } from '../models/User';

const userRepository = {
  async getAll(): Promise<User[]> {
    try {
      const users = await db.users.toArray();

      return users;
    } catch (e) {
      console.error(e);

      return [];
    }
  },
  async create(data: User): Promise<string | null> {
    try {
      const id = await db.users.add({
        ...data
      });

      return id;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  async read(id: string): Promise<User | null> {
    try {
      const user = await db.users.get(id);

      return user ?? null;
    } catch (e) {
      console.error(e);

      return null;
    }
  },
  csvHeader(): string {
    return 'id,resolution.width,resolution.height,userAgent,timestamp';
  },
  async toCsv(data: User): Promise<string> {
    return `${data.id},${data.resolution.width},${data.resolution.height},"${data.userAgent}",${data.timestamp}`;
  },
};

export default userRepository;