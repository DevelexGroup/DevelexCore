import type { GazeDataPoint } from '../GazeData/GazeData';
import type { GazeInteractionEvents } from './GazeInteraction';
import type { GazeInteractionFixationSettings } from './GazeInteractionObjectFixationSettings';

export interface GazeInteractionObjectFixationInEvents extends GazeInteractionEvents {
	'fixationIn': GazeInteractionObjectFixationInEvent;
	'fixationInProgress': GazeInteractionObjectFixationInEvent;
	'fixationInEnd': GazeInteractionObjectFixationInEvent;
	'fixationInStart': GazeInteractionObjectFixationInEvent;
}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionFixationSettings} settings for the fixation event, including the fixation time and callbacks.
 */
export interface GazeInteractionObjectFixationInEvent {
	type: 'fixationInProgress' | 'fixationInEnd' | 'fixationInStart';
	timestamp: number;
	duration: number;
	target: Element;
	settings: GazeInteractionFixationSettings;
	gazeData: GazeDataPoint;
}

export interface GazeInteractionObjectFixationInProgressEvent extends GazeInteractionObjectFixationInEvent {
	type: 'fixationInProgress';
}

export interface GazeInteractionObjectFixationInEndEvent extends GazeInteractionObjectFixationInEvent {
	type: 'fixationInEnd';
}

export interface GazeInteractionObjectFixationInStartEvent extends GazeInteractionObjectFixationInEvent {
	type: 'fixationInStart';
}


