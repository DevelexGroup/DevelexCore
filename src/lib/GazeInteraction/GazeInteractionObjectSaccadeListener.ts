import type { GazeInteractionSaccadeSettingsType } from './GazeInteractionObjectSaccadeSettings';

/**
 * Listener object for GazeInteractionSaccade.
 * @property {GazeInteractionSaccadeSettingsType} settings for the listener, including the saccade time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectSaccadeListener {
	settings: GazeInteractionSaccadeSettingsType;
	element: Element;
	isActive: boolean;
}
