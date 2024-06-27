import type { ETDwellCallbackType } from './ETDwellCallbackType';

/**
 * Needed for the dwell event listener setup.
 * @property {number} dwellTime The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {number} bufferSize The time in milliseconds that the user must dwell on an element to trigger the event.
 * @property {ETDwellCallbackType} onDwellProgress The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {ETDwellCallbackType} onDwellFinish The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 * @property {ETDwellCallbackType} onDwellCancel The callback function to be called when the user has been dwelling on an element for dwellTime milliseconds.
 */
export interface ETDwellSettingsType {
	dwellTime: number;
	bufferSize: number;
	onDwellProgress: ETDwellCallbackType;
	onDwellFinish: ETDwellCallbackType;
	onDwellCancel: ETDwellCallbackType;
}
