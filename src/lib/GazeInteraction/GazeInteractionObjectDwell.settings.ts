import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectDwellEvent } from './GazeInteractionObjectDwell.event';

/**
 * Needed for the dwell event listener setup.
 * @property {number} dwellTime The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {number} bufferSize The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {number} toleranceTime The time in milliseconds that the user can be outside the element before the dwell is canceled.
 *                                  During this tolerance period, dwell progression continues as if the gaze was still on the element.
 * @property {GazeInteractionDwellCallbackType} onDwellProgress The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {GazeInteractionDwellCallbackType} onDwellFinish The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {GazeInteractionDwellCallbackType} onDwellCancel The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 */
export interface GazeInteractionDwellSettingsType {
	dwellTime: number;
	bufferSize: number;
	toleranceTime: number;
	onDwellProgress: (event: GazeInteractionObjectDwellEvent) => void;
	onDwellFinish: (event: GazeInteractionObjectDwellEvent) => void;
	onDwellCancel: (event: GazeInteractionObjectDwellEvent) => void;
}

/**
 * Listener object for GazeInteractionDwell.
 * @property {GazeInteractionDwellSettingsType} settings for the listener, including the dwell time and callbacks.
 * @property {Element} element that the listener is attached to.
 * @property {number | null} timestamp of when the dwell started, or null if the dwell is not active.
 * @property {number | null} lastOutsideTimestamp of when the gaze last went outside the element, or null if the gaze is currently inside the element.
 */
export interface GazeInteractionObjectDwellListener {
	settings: GazeInteractionDwellSettingsType;
	element: Element;
	timestamp: number | null;
	lastOutsideTimestamp: number | null;
}

export interface GazeInteractionObjectDwellPayload {
	data: GazeDataPoint;
	listener: GazeInteractionObjectDwellListener;
}

