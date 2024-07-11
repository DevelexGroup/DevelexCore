import type { GazeInteractionObjectSaccadeInEvent } from "./GazeInteractionObjectSaccadeEvent";
import type { GazeInteractionScreenSaccadeEvent } from "./GazeInteractionScreenSaccadeEvent";

/**
 * Listener object for GazeInteractionSaccadeIn.
 * @property {GazeInteractionSaccadeInSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */

export interface GazeInteractionObjectSaccadeInListener {
	settings: GazeInteractionSaccadeInSettings;
	element: Element;
}

export interface GazeInteractionObjectSaccadeInPayload {
	data: GazeInteractionScreenSaccadeEvent;
	listener: GazeInteractionObjectSaccadeInListener;
}

/**
 * Needed for the saccade event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must saccade on an element to trigger the event.
 * @property {GazeInteractionSaccadeCallbackType} onSaccadeEnd The callback function to be called when the user starts saccadeing on an element.
 */
export interface GazeInteractionSaccadeInSettings {
	bufferSize: number;
	saccadeFrom: (event: GazeInteractionObjectSaccadeInEvent) => void;
	saccadeTo: (event: GazeInteractionObjectSaccadeInEvent) => void;
}
