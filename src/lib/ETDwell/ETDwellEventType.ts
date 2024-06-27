import type { GazeDataPoint } from '../ETGazeData/ETGazeData';
import type { ETDwellSettingsType } from './ETDwellSettingsType';

/**
 * Fired when a dwell event occurs.
 * @property {'dwellProgress' | 'dwellFinish' | 'dwellCancel'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} elapsed time since the dwell was activated.
 * @property {Element} target of the dwell event.
 * @property {ETDwellSettingsType} settings for the dwell event, including the dwell time and callbacks.
 *
 *
 */
export interface ETDwellEventType {
	type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel';
	timestamp: number;
	elapsed: number;
	target: Element;
	settings: ETDwellSettingsType;
	gazeData: GazeDataPoint;
}
