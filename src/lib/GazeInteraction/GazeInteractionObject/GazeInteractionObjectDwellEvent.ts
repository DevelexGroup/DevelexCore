import type { GazeDataPoint } from '../../GazeData/GazeData';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionObjectDwellSettings';

/**
 * Fired when a dwell event occurs.
 * @property {'dwellProgress' | 'dwellFinish' | 'dwellCancel'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the dwell was activated.
 * @property {Element} target of the dwell event.
 * @property {GazeInteractionDwellSettingsType} settings for the dwell event, including the dwell time and callbacks.
 */
export interface GazeInteractionObjectDwellEvent {
	type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel';
	timestamp: number;
	duration: number;
	target: Element;
	settings: GazeInteractionDwellSettingsType;
	gazeData: GazeDataPoint;
}
