import Dexie, { type Table } from 'dexie';
import type { User } from './models/User';
import type { Click } from './models/Click';
import type { Answer } from './models/Answer';
import type { Aoi } from './models/Aoi';

export class SurveyDatabase extends Dexie {
  users!: Table<User>;
  clicks!: Table<Click>;
  answers!: Table<Answer>;
  aois!: Table<Aoi>;

  constructor() {
    super('SurveyTask');

    this.version(2).stores({
      users: '&id, resolution.width, resolution.height, userAgent, timestamp',
      clicks: '++id, userId, aoiId, x, y, value, timestamp',
      answers: '++id, userId, questionId, answer, timestamp',
      aois: '++id, userId, aoiId, leftBotPos.x, leftBotPos.y, rightTopPos.x, rightTopPos.y',
    });
  }
};

export const db = new SurveyDatabase();