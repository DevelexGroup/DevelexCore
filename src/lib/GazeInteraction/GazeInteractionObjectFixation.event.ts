import type { FixationDataPoint } from '../GazeData/GazeData';
import type { GazeInteractionObjectFixationSettings } from './GazeInteractionObjectFixation.settings';

export type GazeInteractionObjectFixationEvents = {
	'fixationObjectProgress': GazeInteractionObjectFixationEvent;
	'fixationObjectEnd': GazeInteractionObjectFixationEvent;
	'fixationObjectStart': GazeInteractionObjectFixationEvent;
};

/**
 * Fired when a fixation event occurs.
 * @property {'fixationObjectProgress' | 'fixationObjectEnd' | 'fixationObjectStart'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionFixationSettings} settings for the fixation event, including the fixation time and callbacks.
 */
export interface GazeInteractionObjectFixationEvent extends Omit<FixationDataPoint, 'type'> {
	fixationId: number;
	duration: number;
	target: Element[];
	settings: GazeInteractionObjectFixationSettings[];
	type: 'fixationObjectProgress' | 'fixationObjectEnd' | 'fixationObjectStart'
}