import type { GazeDataPointWithFixation } from '../GazeData/GazeData';
import type { GazeInteractionSaccadeInSettings } from './GazeInteractionObjectSaccadeSettings';
import type { GazeInteractionEvents } from './GazeInteraction';

export interface GazeInteractionObjectSaccadeInEvents extends GazeInteractionEvents {
    'saccadeIn': GazeInteractionObjectSaccadeInEvent,
	'saccadeFrom': GazeInteractionObjectSaccadeToEvent,
	'saccadeTo': GazeInteractionObjectSaccadeFromEvent
}

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeTo' | 'saccadeFrom'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the saccade started.
 * @property {number} angleToScreen of the saccade event. Always present.
 * @property {number} angleToPrevious of the saccade event.
 * @property {number} angleToPreviousInvalidityTime of the saccade event.
 * @property {Element} target of the saccade event.
 * @property {Element} originTarget of the saccade event.
 * @property {GazeDataPointWithFixation} gazeData of the saccade event. I.e. the first gaze data point of the fixation.
 * @property {GazeDataPointWithFixation} originGazeData of the saccade event.
 * @property {GazeInteractionSaccadeInSettings} settings for the saccade event, including the saccade time and callbacks.
 */
export interface GazeInteractionObjectSaccadeInEvent {
	type: 'saccadeTo' | 'saccadeFrom';
	timestamp: number;
	duration: number;
	distance: number;
    angleToScreen: number;
    angleToPrevious?: number;
    angleToPreviousInvalidityTime?: number;
	target: Element;
	settings: GazeInteractionSaccadeInSettings;
	gazeData: GazeDataPointWithFixation;
    originGazeData: GazeDataPointWithFixation;
}

export interface GazeInteractionObjectSaccadeToEvent extends GazeInteractionObjectSaccadeInEvent {
	type: 'saccadeTo';
}

export interface GazeInteractionObjectSaccadeFromEvent extends GazeInteractionObjectSaccadeInEvent {
	type: 'saccadeFrom';
}
