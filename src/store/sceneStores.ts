import { writable } from 'svelte/store';
import { GazeDataCircularBuffer } from '$lib/GazeData/GazeDataCircularBuffer';
import type { GazeInputMessage } from '$lib/GazeInput/GazeInputEvent';
import type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObjectDwellEvent';
import type { GazeInteractionObjectFixationEvent } from '$lib/GazeInteraction/GazeInteractionObjectFixationEvent';

export const scenePointDataStore = writable<GazeDataCircularBuffer>(new GazeDataCircularBuffer(300));

export const sceneStateStore = writable<GazeInputMessage[]>([]);

// Define the writable store with a custom update function
export const sceneObjectDwellStore = writable<GazeInteractionObjectDwellEvent[]>([]);

// Function to add new events to the store
export const addDwellEvent = (event: GazeInteractionObjectDwellEvent) => {
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

export const sceneObjectFixationStore = writable<GazeInteractionObjectFixationEvent[]>([]);

export const addFixationEvent = (event: GazeInteractionObjectFixationEvent) => {
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