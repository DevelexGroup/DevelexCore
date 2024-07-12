import type { GazeInteractionObjectFixationEvent, GazeInteractionObjectFixationEvents } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationEvent';
import type { GazeInteractionInFixationSettings } from './GazeInteractionObjectSetFixationSettings';

export interface GazeInteractionObjectInFixationEvents extends GazeInteractionObjectFixationEvents {
	'fixationSet': GazeInteractionObjectInFixationEvent;
	'fixationSetProgress': GazeInteractionObjectInFixationEvent;
	'fixationSetEnd': GazeInteractionObjectInFixationEvent;
	'fixationSetStart': GazeInteractionObjectInFixationEvent;
}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {Element} target of the fixation event.
 * @extends GazeInteractionObjectFixationEvent
 */
export interface GazeInteractionObjectInFixationEvent extends GazeInteractionObjectFixationEvent {
	type: 'fixationSetProgress' | 'fixationSetEnd' | 'fixationSetStart';
	target: Element[];
	settings: GazeInteractionInFixationSettings[];
}

export interface GazeInteractionObjectInFixationProgressEvent extends GazeInteractionObjectInFixationEvent {
	type: 'fixationSetProgress';
}

export interface GazeInteractionObjectInFixationEndEvent extends GazeInteractionObjectInFixationEvent {
	type: 'fixationSetEnd';
}

export interface GazeInteractionObjectInFixationStartEvent extends GazeInteractionObjectInFixationEvent {
	type: 'fixationSetStart';
}


