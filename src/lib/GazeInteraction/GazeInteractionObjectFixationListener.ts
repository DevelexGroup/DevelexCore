import type { GazeInteractionFixationSettingsType } from './GazeInteractionObjectFixationSettings';

/**
 * Listener object for GazeInteractionFixation.
 * @property {GazeInteractionFixationSettingsType} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectFixationListener {
	settings: GazeInteractionFixationSettingsType;
	element: Element;
	isActive: boolean;
}
