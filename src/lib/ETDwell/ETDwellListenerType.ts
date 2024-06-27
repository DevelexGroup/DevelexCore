import type { ETDwellSettingsType } from './ETDwellSettingsType';

/**
 * Listener object for ETDwell.
 * @property {ETDwellSettingsType} settings for the listener, including the dwell time and callbacks.
 * @property {Element} element that the listener is attached to.
 * @property {number | null} timestamp of when the dwell started, or null if the dwell is not active.
 */
export interface ETDwellListenerType {
	settings: ETDwellSettingsType;
	element: Element;
	timestamp: number | null;
}
