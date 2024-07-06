import type { GazeDataPoint } from '../GazeData/GazeData';
import type { GazeInteractionFixationSettingsType } from './GazeInteractionObjectFixationSettings';

/**
 * Fired when a fixation event occurs.
 * @property {'fixationProgress' | 'fixationFinish' | 'fixationCancel'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the fixation started.
 * @property {Element} target of the fixation event.
 * @property {GazeInteractionfixationSettingsType} settings for the fixation event, including the fixation time and callbacks.
 */
export interface GazeInteractionObjectFixationEvent {
	type: 'fixationProgress' | 'fixationEnd' | 'fixationStart';
	timestamp: number;
	duration: number;
	target: Element;
	settings: GazeInteractionFixationSettingsType;
	gazeData: GazeDataPoint;
}
