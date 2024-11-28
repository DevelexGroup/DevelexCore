import type { GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionEvent } from './GazeInteraction.event';

export type GazeInteractionScreenFixationEvents = {
    'fixation': GazeInteractionScreenFixationEvent,
    'fixationStart': GazeInteractionScreenFixationEvent,
    'fixationEnd': GazeInteractionScreenFixationEvent,
    'fixationProgress': GazeInteractionScreenFixationEvent
};

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationEnd' | 'fixationStart'} type of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionfixationSettingsType} settings for the fixation event, including the fixation time and callbacks.
 */
export type GazeInteractionScreenFixationEvent = {
    type: 'fixationProgress' | 'fixationEnd' | 'fixationStart';
	duration: number;
	gazeData: GazeDataPointWithFixation;
    fixationId: number;
} & GazeInteractionEvent;