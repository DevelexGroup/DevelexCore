import type { GazeInteractionObjectInSaccadeSettings } from './GazeInteractionObjectSetSaccadeSettings';
import type { GazeInteractionObjectSaccadeEvent, GazeInteractionObjectSaccadeEvents } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccadeEvent';

export interface GazeInteractionObjectInSaccadeEvents extends GazeInteractionObjectSaccadeEvents {
    'saccadeIn': GazeInteractionObjectInSaccadeEvent,
	'saccadeInFrom': GazeInteractionObjectInSaccadeToEvent,
	'saccadeInTo': GazeInteractionObjectInSaccadeFromEvent
}

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeTo' | 'saccadeFrom'} type of the event.
 * @property {Element} target of the saccade event.
 * @property {GazeDataPointWithFixation} gazeData of the saccade event. I.e. the first gaze data point of the fixation.
 * @property {GazeDataPointWithFixation} originGazeData of the saccade event.
 * @property {GazeInteractionInSaccadeSettings} settings for the saccade event, including the saccade time and callbacks.
 */
export interface GazeInteractionObjectInSaccadeEvent extends GazeInteractionObjectSaccadeEvent {
	type: 'saccadeTo' | 'saccadeFrom';
	target: Element;
	settings: GazeInteractionObjectInSaccadeSettings;
}

export interface GazeInteractionObjectInSaccadeToEvent extends GazeInteractionObjectInSaccadeEvent {
	type: 'saccadeTo';
}

export interface GazeInteractionObjectInSaccadeFromEvent extends GazeInteractionObjectInSaccadeEvent {
	type: 'saccadeFrom';
}
