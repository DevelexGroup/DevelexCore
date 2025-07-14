import { writable, type Writable } from 'svelte/store';
import type { GazeInputEventError, GazeInputEventState } from '$lib/GazeInput/GazeInputEvent';
import type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObjectDwell.event';
import type { GazeInteractionObjectFixationEvent } from '$lib/GazeInteraction/GazeInteractionObjectFixation.event';
import type { GazeInteractionObjectSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.event';
import { TimedCircularBuffer } from '$lib/Helper/HelperCircularBuffer';

// ---------------------------------------------------------------------------
// Constants governing buffer behaviour
// ---------------------------------------------------------------------------

// Snapshot events are emitted at ~60 FPS for smooth UI updates (≈16 ms)
const SNAPSHOT_INTERVAL_MS = 1000 / 60;

// Update events – used to persist data to Dexie – run once per second
const UPDATE_INTERVAL_MS = 1000;

// Internal buffer capacity – large enough to hold all items that may arrive
// between two update events plus some margin.
const BUFFER_SIZE = 2048;

// How many items the UI is interested in at once (per snapshot)
const SNAPSHOT_COUNT = 60;

// ---------------------------------------------------------------------------
// Helper to wire a TimedCircularBuffer to both UI (snapshot) and Dexie (update)
// ---------------------------------------------------------------------------

function createTimedStores<T>(
  repository: { createMany(data: T[]): Promise<unknown>; },
): { uiStore: Writable<T[]>; buffer: TimedCircularBuffer<T>; }
{
  const uiStore = writable<T[]>([]);
  const buffer  = new TimedCircularBuffer<T>(BUFFER_SIZE, SNAPSHOT_COUNT, SNAPSHOT_INTERVAL_MS, UPDATE_INTERVAL_MS);

  // UI snapshots
  buffer.on('snapshot', ({ items }) => {
    const reversedItems = [...items].reverse();
    uiStore.set(reversedItems as T[]);
  });

  // Persist to Dexie in bulk
  buffer.on('update', ({ items }) => { void repository.createMany(items as T[]); });

  return { uiStore, buffer };
}

import type { Dwell } from '../database/models/Dwell';
import dwellRepository from '../database/repositories/dwell.repository';
import type { Fixation } from '../database/models/Fixation';
import fixationRepository from '../database/repositories/fixation.repository';
import type { Saccade } from '../database/models/Saccade';
import saccadeRepository from '../database/repositories/saccade.repository';
import type { GazeDataPoint } from '$lib/index';
import type { Validation } from '../database/models/Validation';
import validationRepository from '../database/repositories/validation.repository';
import type { GazeInteractionObjectValidationEvent } from '$lib/GazeInteraction/GazeInteractionObjectValidation.event';
import type { GazeInteractionObjectIntersectEvent } from '$lib/GazeInteraction/GazeInteractionObjectIntersect.event';
import type { Intersect } from '../database/models/Intersect';
import intersectRepository from '../database/repositories/intersect.repository';
import type { Point } from '../database/models/Point';
import pointRepository from '../database/repositories/point.repository';

export const sceneStateStore = writable<GazeInputEventState[]>([]);

export const sceneErrorStore = writable<GazeInputEventError[]>([]);

// --------------------------------------------------------------------------------
// DWELL EVENTS
// --------------------------------------------------------------------------------

const dwell = createTimedStores<Dwell>(dwellRepository);
export const sceneObjectDwellStore = dwell.uiStore;

// Function to add new events to the Dwell buffer
export const addDwellEvent = (unprocessedEvent: GazeInteractionObjectDwellEvent) => {
    // Extract the relevant information from the event
    const { type, sessionId, timestamp, duration, gazeData, target } = unprocessedEvent;
    // convert target id to string
    const aoi = target[0]?.id.toString();

    const event: Dwell = {
        sessionId,
        timestamp,
        aoi,
        duration,
        gazeData,
        type
    };

    dwell.buffer.push(event);
};

// --------------------------------------------------------------------------------
// FIXATION EVENTS
// --------------------------------------------------------------------------------

const fixation = createTimedStores<Fixation>(fixationRepository);
export const sceneObjectFixationStore = fixation.uiStore;

export const addFixationEvent = (unprocessedEvent: GazeInteractionObjectFixationEvent) => {
    // Extract the relevant information from the event
    // leave out target and settings, keep everything else
    const { type, sessionId, parseValidity, timestamp, deviceTimestamp, duration, x, y, xScreenRelative, yScreenRelative, deviceId, fixationId, target } = unprocessedEvent;
    // convert target, which is array of Elements, id to string delimited by ;
    // check if Array.isArray(target) is true
    const aoi = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

    const event: Fixation = {
        type,
        sessionId,
        timestamp,
        deviceTimestamp,
        aoi,
        duration,
        x,
        y,
        xScreenRelative,
        yScreenRelative,
        deviceId,
        fixationId,
        parseValidity
    };

    fixation.buffer.push(event);
};

// --------------------------------------------------------------------------------
// INTERSECT EVENTS
// --------------------------------------------------------------------------------

const intersectB = createTimedStores<Intersect>(intersectRepository);
export const sceneIntersectStore = intersectB.uiStore;

export const addIntersectEvent = (unprocessedEvent: GazeInteractionObjectIntersectEvent) => {
    const { type, sessionId, timestamp, gazeData, target } = unprocessedEvent;
    const aoi = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

    const event: Intersect = {
        type,
        sessionId,
        timestamp,
        aoi,
        gazeData
    };

    intersectB.buffer.push(event);
};

// --------------------------------------------------------------------------------
// SACCADE EVENTS
// --------------------------------------------------------------------------------

const saccadeB = createTimedStores<Saccade>(saccadeRepository);
export const sceneObjectSaccadeStore = saccadeB.uiStore;

export const addSaccadeEvent = (unprocessedEvent: GazeInteractionObjectSaccadeEvent) => {
    // Extract the relevant information from the event
    const { type, sessionId, angleToScreen, timestamp, duration, distance, target, originFixation, targetFixation } = unprocessedEvent;
    // convert target, which is array of Elements, id to string delimited by ;
    // check if Array.isArray(target) is true
    const aoi = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

    const event: Saccade = {
        type,
        sessionId,
        timestamp,
        aoi,
        duration,
        distance,
        angleToScreen,
        originFixation,
        targetFixation
    };

    saccadeB.buffer.push(event);
};

// --------------------------------------------------------------------------------
// POINT EVENTS
// --------------------------------------------------------------------------------

const pointB = createTimedStores<Point>(pointRepository);
export const scenePointStore = pointB.uiStore;

export const addPointEvent = (data: GazeDataPoint) => {
    pointB.buffer.push(data);
};

// --------------------------------------------------------------------------------
// VALIDATION EVENTS
// --------------------------------------------------------------------------------

const validationB = createTimedStores<Validation>(validationRepository);
export const sceneObjectValidationStore = validationB.uiStore;

export const addValidationEvent = (event: GazeInteractionObjectValidationEvent) => {
    // erase gazeDataPoints from the event
    const { gazeDataPoints, ...rest } = event;
    void gazeDataPoints;

    validationB.buffer.push(rest as Validation);
};