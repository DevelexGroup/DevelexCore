import type { GazeInteractionDwellCallbackType } from './GazeInteractionDwellCallbackType';

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
	onDwellProgress: GazeInteractionDwellCallbackType;
	onDwellFinish: GazeInteractionDwellCallbackType;
	onDwellCancel: GazeInteractionDwellCallbackType;
}
