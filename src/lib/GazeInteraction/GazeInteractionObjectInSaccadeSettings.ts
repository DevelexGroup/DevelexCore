import type { GazeInteractionObjectInSaccadeEvent } from "./GazeInteractionObjectInSaccadeEvent";
import type { GazeInteractionObjectSaccadeListener, GazeInteractionObjectSaccadePayload, GazeInteractionSaccadeSettings } from "./GazeInteractionObjectSaccadeSettings";

/**
 * Listener object for GazeInteractionInSaccade.
 * @property {GazeInteractionObjectInSaccadeSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectInSaccadeListener extends GazeInteractionObjectSaccadeListener {
	settings: GazeInteractionObjectInSaccadeSettings;
	element: Element;
}

export interface GazeInteractionObjectInSaccadePayload extends GazeInteractionObjectSaccadePayload {
	listener: GazeInteractionObjectInSaccadeListener;
}

/**
 * Needed for the saccade event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must saccade on an element to trigger the event.
 * @property {GazeInteractionInSaccadeCallbackType} onInSaccadeEnd The callback function to be called when the user starts saccadeing on an element.
 */
export interface GazeInteractionObjectInSaccadeSettings extends GazeInteractionSaccadeSettings {
	saccadeFrom: (event: GazeInteractionObjectInSaccadeEvent) => void;
	saccadeTo: (event: GazeInteractionObjectInSaccadeEvent) => void;
}
