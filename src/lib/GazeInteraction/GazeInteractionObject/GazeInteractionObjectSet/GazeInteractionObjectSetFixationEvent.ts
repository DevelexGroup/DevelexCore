import type { GazeInteractionObjectFixationEvent, GazeInteractionObjectFixationEvents } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationEvent';
import type { GazeInteractionObjectSetFixationSettings } from './GazeInteractionObjectSetFixationSettings';

export interface GazeInteractionObjectSetFixationEvents extends GazeInteractionObjectFixationEvents {
	'fixationSet': GazeInteractionObjectSetFixationEvent;
	'fixationSetProgress': GazeInteractionObjectSetFixationEvent;
	'fixationSetEnd': GazeInteractionObjectSetFixationEvent;
	'fixationSetStart': GazeInteractionObjectSetFixationEvent;
}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {Element} target of the fixation event.
 * @extends GazeInteractionObjectFixationEvent
 */
export interface GazeInteractionObjectSetFixationEvent extends GazeInteractionObjectFixationEvent {
	type: 'fixationSetProgress' | 'fixationSetEnd' | 'fixationSetStart';
	target: Element[];
	settings: GazeInteractionObjectSetFixationSettings[];
}

export interface GazeInteractionObjectSetFixationProgressEvent extends GazeInteractionObjectSetFixationEvent {
	type: 'fixationSetProgress';
}

export interface GazeInteractionObjectSetFixationEndEvent extends GazeInteractionObjectSetFixationEvent {
	type: 'fixationSetEnd';
}

export interface GazeInteractionObjectSetFixationStartEvent extends GazeInteractionObjectSetFixationEvent {
	type: 'fixationSetStart';
}


