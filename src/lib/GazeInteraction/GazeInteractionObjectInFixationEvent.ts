import type { GazeDataPointWithFixation } from '../GazeData/GazeData';
import type { GazeInteractionObjectFixationEvent, GazeInteractionObjectFixationEvents } from './GazeInteractionObjectFixationEvent';
import type { GazeInteractionFixationSettings } from './GazeInteractionObjectFixationSettings';

export interface GazeInteractionObjectFixationInEvents extends GazeInteractionObjectFixationEvents {
	'fixationIn': GazeInteractionObjectFixationInEvent;
	'fixationInProgress': GazeInteractionObjectFixationInEvent;
	'fixationInEnd': GazeInteractionObjectFixationInEvent;
	'fixationInStart': GazeInteractionObjectFixationInEvent;
}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {Element} target of the fixation event.
 * @extends GazeInteractionObjectFixationEvent
 */
export interface GazeInteractionObjectFixationInEvent extends GazeInteractionObjectFixationEvent {
	type: 'fixationInProgress' | 'fixationInEnd' | 'fixationInStart';
	target: Element;
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


