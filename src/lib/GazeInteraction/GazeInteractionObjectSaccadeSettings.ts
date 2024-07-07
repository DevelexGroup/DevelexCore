import type { GazeInteractionSaccadeCallbackType } from './GazeInteractionObjectSaccadeCallback';

/**
 * Needed for the saccade event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must saccade on an element to trigger the event.
 * @property {GazeInteractionSaccadeCallbackType} onSaccadeEnd The callback function to be called when the user starts saccadeing on an element.
 */
export interface GazeInteractionSaccadeSettingsType {
	bufferSize: number;
	onSaccadeFrom?: GazeInteractionSaccadeCallbackType;
	onSaccadeTo?: GazeInteractionSaccadeCallbackType;
}
