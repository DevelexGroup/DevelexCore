import { writable } from 'svelte/store';
import { GazeDataCircularBuffer } from '$lib/GazeData/GazeDataCircularBuffer';
import type { GazeInputMessage } from '$lib/GazeInput/GazeInputEvent';
import type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObjectDwell.event';
import type { GazeInteractionObjectFixationEvent } from '$lib/GazeInteraction/GazeInteractionObjectFixation.event';
import type { GazeInteractionObjectSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.event';

import type { Dwell } from '../database/models/Dwell';
import dwellRepository from '../database/repositories/dwell.repository';
import type { Fixation } from '../database/models/Fixation';
import fixationRepository from '../database/repositories/fixation.repository';
import type { Saccade } from '../database/models/Saccade';
import saccadeRepository from '../database/repositories/saccade.repository';
import type { GazeDataPoint } from '$lib';
import pointRepository from '../database/repositories/point.repository';
import type { Validation } from '../database/models/Validation';
import validationRepository from '../database/repositories/validation.repository';
import type { GazeInteractionObjectValidationEvent } from '$lib/GazeInteraction/GazeInteractionObjectValidation.event';
import type { GazeInteractionObjectIntersectEvent } from '$lib/GazeInteraction/GazeInteractionObjectIntersect.event';
import type { Intersect } from '../database/models/Intersect';
import intersectRepository from '../database/repositories/intersect.repository';

export const scenePointDataStore = writable<GazeDataCircularBuffer>(new GazeDataCircularBuffer(300));

export const sceneStateStore = writable<GazeInputMessage[]>([]);

// Define the writable store with a custom update function
export const sceneObjectDwellStore = writable<Dwell[]>([]);

// Function to add new events to the store
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

    void dwellRepository.create(event);

    sceneObjectDwellStore.update(events => {
        // Add the new event
        const updatedEvents = [event, ...events];
        
        // If there are more than 100 events, remove the oldest one
        if (updatedEvents.length > 100) {
            updatedEvents.pop();
        }
        
        return updatedEvents;
    });
}

export const sceneObjectFixationStore = writable<Fixation[]>([]);

export const addFixationEvent = (unprocessedEvent: GazeInteractionObjectFixationEvent) => {
    // Extract the relevant information from the event
    const { type, sessionId, timestamp, duration, gazeData, target, fixationId } = unprocessedEvent;
    // convert target, which is array of Elements, id to string delimited by ;
    // check if Array.isArray(target) is true
    const aoi = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

    const event: Fixation = {
        type,
        sessionId,
        timestamp,
        aoi,
        duration,
        gazeData,
        fixationId
    };

    void fixationRepository.create(event);

    sceneObjectFixationStore.update(events => {
        // Add the new event
        const updatedEvents = [event, ...events];
        
        // If there are more than 100 events, remove the oldest one
        if (updatedEvents.length > 100) {
            updatedEvents.pop();
        }
        
        return updatedEvents;
    });
}

export const sceneObjectIntersectStore = writable<Intersect[]>([]);

export const addIntersectEvent = (unprocessedEvent: GazeInteractionObjectIntersectEvent) => {
    // Extract the relevant information from the event
    const { type, sessionId, timestamp, gazeData, target } = unprocessedEvent;
    // convert target, which is array of Elements, id to string delimited by ;
    // check if Array.isArray(target) is true
    const aoi = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

    const event: Intersect = {
        type,
        sessionId,
        timestamp,
        aoi,
        gazeData
    };

    void intersectRepository.create(event);

    sceneObjectIntersectStore.update(events => {
        // Add the new event
        const updatedEvents = [event, ...events];
        
        // If there are more than 100 events, remove the oldest one
        if (updatedEvents.length > 100) {
            updatedEvents.pop();
        }
        
        return updatedEvents;
    });
}

export const sceneObjectSaccadeStore = writable<Saccade[]>([]);

export const addSaccadeEvent = (unprocessedEvent: GazeInteractionObjectSaccadeEvent) => {
    // Extract the relevant information from the event
    const { type, sessionId, timestamp, duration, distance, gazeData, target, originGazeData, angleToScreen, angleToPrevious, angleToPreviousInvalidityTime } = unprocessedEvent;
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
        gazeData,
        originGazeData,
        angleToScreen,
        angleToPrevious,
        angleToPreviousInvalidityTime
    };

    void saccadeRepository.create(event);

    sceneObjectSaccadeStore.update(events => {
        // Add the new event
        const updatedEvents = [event, ...events];
        
        // If there are more than 100 events, remove the oldest one
        if (updatedEvents.length > 100) {
            updatedEvents.pop();
        }
        
        return updatedEvents;
    });
}

export const addPointEvent = (e: GazeDataPoint) => {
    void pointRepository.create(e);
}

export const sceneObjectValidationStore = writable<Validation[]>([]);

export const addValidationEvent = (event: GazeInteractionObjectValidationEvent) => {
    // erase gazeDataPoints from the event
    const { gazeDataPoints, ...rest } = event;
    void gazeDataPoints;
    void validationRepository.create(rest);

    sceneObjectValidationStore.update(events => {
        // Add the new event
        const updatedEvents = [event, ...events];
        
        // If there are more than 100 events, remove the oldest one
        if (updatedEvents.length > 100) {
            updatedEvents.pop();
        }
        
        return updatedEvents;
    });
}