import Dexie, { type Table } from 'dexie';
import type { Fixation } from './models/Fixation';
import type { Saccade } from './models/Saccade';
import type { Dwell } from './models/Dwell';
import type { Point } from './models/Point';
import type { Validation } from './models/Validation';

export class DevelexCoreControlDatabase extends Dexie {
  fixations!: Table<Fixation>;
  saccades!: Table<Saccade>;
  dwells!: Table<Dwell>;
  points!: Table<Point>;
  validations!: Table<Validation>;

  constructor() {
    super('develex-core-control');

    this.version(3).stores({
      fixations: '++id, sessionId, timestamp, type, duration, aoi, gazeData',
      saccades: '++id, sessionId, timestamp, type, duration, aoi, angleToScreen, angleToPrevious, angleToPreviousInvalidityTime, gazeData, originGazeData',
      dwells: '++id, sessionId, timestamp, type, duration, aoi, gazeData',
      points: '++id, sessionId, timestamp, x, xL, xR, xLScreenRelative, xRScreenRelative, y, yL, yR, yLScreenRelative, yRScreenRelative, validityL, validityR, parseValidity, fixationDuration, fixationId',
      validations: '++id, sessionId, timestamp, type, isValid, allDataPointsCount, validDataPointsCount, validDataPointsPercentage, accuracy, precision'
    });
  }
};

export const db = new DevelexCoreControlDatabase();