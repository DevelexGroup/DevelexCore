import type { GazeInteractionScreenSaccadeEvent } from "$lib/GazeInteraction/GazeInteractionScreenSaccadeEvent";
import type { GazeInteractionObjectSaccadeEvent } from "./GazeInteractionObjectSaccade.event";

/**
 * Listener object for GazeInteractionSaccade.
 * @property {GazeInteractionSaccadeSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */

export interface GazeInteractionObjectSaccadeListener {
	settings: GazeInteractionObjectSaccadeSettings;
	element: Element;
}

export interface GazeInteractionObjectSaccadePayload {
	data: GazeInteractionScreenSaccadeEvent;
	listener: GazeInteractionObjectSaccadeListener;
}

/**
 * Needed for the saccade event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must saccade on an element to trigger the event.
 * @property {GazeInteractionSaccadeCallbackType} onSaccadeEnd The callback function to be called when the user starts saccadeing on an element.
 */
export interface GazeInteractionObjectSaccadeSettings {
	bufferSize: number;
	saccadeObjectFrom: (event: GazeInteractionObjectSaccadeEvent) => void;
	saccadeObjectTo: (event: GazeInteractionObjectSaccadeEvent) => void;
}