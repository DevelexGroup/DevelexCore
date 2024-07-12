import type { GazeDataPointWithFixation } from '../GazeData/GazeData';
import type { GazeInteractionEvents } from './GazeInteraction';
import type { GazeInteractionFixationSettings } from './GazeInteractionObjectFixationSettings';

export interface GazeInteractionObjectFixationEvents extends GazeInteractionEvents {}

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionFixationSettings} settings for the fixation event, including the fixation time and callbacks.
 */
export interface GazeInteractionObjectFixationEvent {
	type: string;
	timestamp: number;
	duration: number;
	settings: GazeInteractionFixationSettings;
	gazeData: GazeDataPointWithFixation;
}

