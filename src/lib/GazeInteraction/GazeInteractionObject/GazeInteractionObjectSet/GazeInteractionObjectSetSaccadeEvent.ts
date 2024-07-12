import type { GazeInteractionObjectSetSaccadeSettings } from './GazeInteractionObjectSetSaccadeSettings';
import type { GazeInteractionObjectSaccadeEvent, GazeInteractionObjectSaccadeEvents } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccadeEvent';

export interface GazeInteractionObjectSetSaccadeEvents extends GazeInteractionObjectSaccadeEvents {
    'saccadeSet': GazeInteractionObjectSetSaccadeEvent,
	'saccadeSetFrom': GazeInteractionObjectSetSaccadeToEvent,
	'saccadeSetTo': GazeInteractionObjectSetSaccadeFromEvent
}

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeTo' | 'saccadeFrom'} type of the event.
 * @property {Element} target of the saccade event.
 * @property {GazeDataPointWithFixation} gazeData of the saccade event. I.e. the first gaze data point of the fixation.
 * @property {GazeDataPointWithFixation} originGazeData of the saccade event.
 * @property {GazeInteractionInSaccadeSettings} settings for the saccade event, including the saccade time and callbacks.
 */
export interface GazeInteractionObjectSetSaccadeEvent extends GazeInteractionObjectSaccadeEvent {
	type: 'saccadeSetTo' | 'saccadeSetFrom';
	target: Element[];
	settings: GazeInteractionObjectSetSaccadeSettings[];
}

export interface GazeInteractionObjectSetSaccadeToEvent extends GazeInteractionObjectSetSaccadeEvent {
	type: 'saccadeSetTo';
}

export interface GazeInteractionObjectSetSaccadeFromEvent extends GazeInteractionObjectSetSaccadeEvent {
	type: 'saccadeSetFrom';
}
