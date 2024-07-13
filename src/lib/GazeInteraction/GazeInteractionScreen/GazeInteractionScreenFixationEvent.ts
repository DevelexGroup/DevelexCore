import type { GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionEvents } from '$lib/GazeInteraction/GazeInteraction';
import type { GazeInteractionEvent } from '../GazeInteractionEvent';

export interface GazeInteractionScreenFixationEvents extends GazeInteractionEvents {
    'fixation': GazeInteractionScreenFixationEvent,
    'fixationStart': GazeInteractionScreenFixationStartEvent,
    'fixationEnd': GazeInteractionScreenFixationEndEvent,
    'fixationProgress': GazeInteractionScreenFixationProgressEvent
}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationEnd' | 'fixationStart'} type of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionfixationSettingsType} settings for the fixation event, including the fixation time and callbacks.
 */
export interface GazeInteractionScreenFixationEvent extends GazeInteractionEvent {
	type: 'fixationProgress' | 'fixationEnd' | 'fixationStart';
	duration: number;
	gazeData: GazeDataPointWithFixation;
}

export interface GazeInteractionScreenFixationStartEvent extends GazeInteractionScreenFixationEvent {
    type: 'fixationStart';
}

export interface GazeInteractionScreenFixationEndEvent extends GazeInteractionScreenFixationEvent {
    type: 'fixationEnd';
}

export interface GazeInteractionScreenFixationProgressEvent extends GazeInteractionScreenFixationEvent {
    type: 'fixationProgress';
}