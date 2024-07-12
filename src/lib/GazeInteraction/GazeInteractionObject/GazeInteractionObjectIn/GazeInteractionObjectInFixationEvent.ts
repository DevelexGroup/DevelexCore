import type { GazeInteractionObjectFixationEvent, GazeInteractionObjectFixationEvents } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationEvent';
import type { GazeInteractionFixationInSettings } from './GazeInteractionObjectInFixationSettings';

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
	settings: GazeInteractionFixationInSettings;
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


