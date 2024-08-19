import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectDwellEvent } from './GazeInteractionObjectDwell.event';

/**
 * Needed for the dwell event listener setup.
 * @property {number} dwellTime The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {number} bufferSize The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {GazeInteractionDwellCallbackType} onDwellProgress The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {GazeInteractionDwellCallbackType} onDwellFinish The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {GazeInteractionDwellCallbackType} onDwellCancel The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 */
export interface GazeInteractionDwellSettingsType {
	dwellTime: number;
	bufferSize: number;
	onDwellProgress: (event: GazeInteractionObjectDwellEvent) => void;
	onDwellFinish: (event: GazeInteractionObjectDwellEvent) => void;
	onDwellCancel: (event: GazeInteractionObjectDwellEvent) => void;
}

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

