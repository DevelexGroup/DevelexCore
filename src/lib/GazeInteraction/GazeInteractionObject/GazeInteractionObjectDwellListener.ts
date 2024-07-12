import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionObjectDwellSettings';

/**
 * Listener object for GazeInteractionDwell.
 * @property {GazeInteractionDwellSettingsType} settings for the listener, including the dwell time and callbacks.
 * @property {Element} element that the listener is attached to.
 * @property {number | null} timestamp of when the dwell started, or null if the dwell is not active.
 */
export interface GazeInteractionObjectDwellListener {
	settings: GazeInteractionDwellSettingsType;
	element: Element;
	timestamp: number | null;
}

export interface GazeInteractionObjectDwellPayload {
	data: GazeDataPoint;
	listener: GazeInteractionObjectDwellListener;
}