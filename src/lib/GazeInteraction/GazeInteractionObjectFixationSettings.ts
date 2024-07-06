import type { GazeInteractionFixationCallbackType } from './GazeInteractionObjectFixationCallback';

/**
 * Needed for the fixation event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must fixation on an element to trigger the event.
 * @property {GazeInteractionFixationCallbackType} onFixationProgress The callback function to be called when the user has been fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationEnd The callback function to be called when the user starts fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationStart The callback function to be called when the user ends fixationing on an element.
 */
export interface GazeInteractionFixationSettingsType {
	bufferSize: number;
	onFixationProgress: GazeInteractionFixationCallbackType;
	onFixationEnd: GazeInteractionFixationCallbackType;
	onFixationStart: GazeInteractionFixationCallbackType;
}
