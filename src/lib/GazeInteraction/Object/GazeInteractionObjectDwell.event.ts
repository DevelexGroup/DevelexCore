import type { GazeDataPoint } from '../../GazeData/GazeData';
import type { GazeInteractionEvents } from '../GazeInteraction';
import type { GazeInteractionEvent } from '../GazeInteractionEvent';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionObjectDwell.settings';

export type GazeInteractionObjectDwellEvents = {
	'dwell': GazeInteractionObjectDwellEvent;
	'dwellProgress': GazeInteractionObjectDwellEvent;
	'dwellFinish': GazeInteractionObjectDwellEvent;
	'dwellCancel': GazeInteractionObjectDwellEvent;
} & GazeInteractionEvents; // it must be a type otherwise it won't be recognized by the Emitter

/**
 * Fired when a dwell event occurs.
 * @property {'dwellProgress' | 'dwellFinish' | 'dwellCancel'} type of the event.
 * @property {number} duration time since the dwell was activated.
 * @property {[Element]} target of the dwell event. Only one element can be the target of a dwell event.
 * @property {GazeInteractionDwellSettingsType} settings for the dwell event, including the dwell time and callbacks.
 */
export interface GazeInteractionObjectDwellEvent extends GazeInteractionEvent {
	type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel';
	duration: number;
	target: [Element];
	settings: GazeInteractionDwellSettingsType;
	gazeData: GazeDataPoint;
}
