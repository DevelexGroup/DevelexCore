import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectIntersectEvent } from './GazeInteractionObjectIntersect.event';

/**
 * Needed for the dwell event listener setup.
 * @property {number} bufferSize - The size of the buffer for the gaze data.
 * @property {(event: GazeInteractionObjectIntersectEvent) => void} onIntersect - The callback function for the intersect event. 
 */
export interface GazeInteractionObjectIntersectSettingsType {
	bufferSize: number;
	onIntersect: (event: GazeInteractionObjectIntersectEvent) => void;
}

/**
 * Listener object for GazeInteractionDwell.
 * @property {GazeInteractionObjectIntersectSettingsType} settings for the listener, including the buffer size and the callback function.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectIntersectListener {
	settings: GazeInteractionObjectIntersectSettingsType;
	element: Element;
}

export interface GazeInteractionObjectIntersectPayload {
	data: GazeDataPoint;
	listener: GazeInteractionObjectIntersectListener;
}

