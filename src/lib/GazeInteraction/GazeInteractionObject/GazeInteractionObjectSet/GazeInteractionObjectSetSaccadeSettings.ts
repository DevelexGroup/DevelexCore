import type { GazeInteractionObjectSetSaccadeEvent } from "./GazeInteractionObjectSetSaccadeEvent";
import type { GazeInteractionObjectSaccadeListener, GazeInteractionObjectSaccadePayload, GazeInteractionSaccadeSettings } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccadeSettings";

/**
 * Listener object for GazeInteractionInSaccade.
 * @property {GazeInteractionObjectSetSaccadeSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectSetSaccadeListener extends GazeInteractionObjectSaccadeListener {
	settings: GazeInteractionObjectSetSaccadeSettings;
	element: Element;
}

export interface GazeInteractionObjectSetSaccadePayload extends GazeInteractionObjectSaccadePayload {
	listener: GazeInteractionObjectSetSaccadeListener;
}

/**
 * Needed for the saccade event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must saccade on an element to trigger the event.
 * @property {GazeInteractionInSaccadeCallbackType} onInSaccadeEnd The callback function to be called when the user starts saccadeing on an element.
 */
export interface GazeInteractionObjectSetSaccadeSettings extends GazeInteractionSaccadeSettings {
	saccadeSetFrom: (event: GazeInteractionObjectSetSaccadeEvent) => void;
	saccadeSetTo: (event: GazeInteractionObjectSetSaccadeEvent) => void;
}
