import type { GazeInteractionObjectFixationInEvent } from "./GazeInteractionObjectFixationEvent";
import type { GazeInteractionScreenFixationEvent } from "./GazeInteractionScreenFixationEvent";

/**
 * Listener object for GazeInteractionFixation.
 * @property {GazeInteractionFixationSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */

export interface GazeInteractionObjectFixationListener {
	settings: GazeInteractionFixationSettings;
	element: Element;
}

export interface GazeInteractionObjectFixationPayload {
	data: GazeInteractionScreenFixationEvent;
	listener: GazeInteractionObjectFixationListener;
}

/**
 * Needed for the fixation event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must fixation on an element to trigger the event.
 * @property {GazeInteractionFixationCallbackType} onFixationProgress The callback function to be called when the user has been fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationEnd The callback function to be called when the user starts fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationStart The callback function to be called when the user ends fixationing on an element.
 */
export interface GazeInteractionFixationSettings {
	bufferSize: number;
	fixationInProgress: (event: GazeInteractionObjectFixationInEvent) => void;
	fixationInEnd: (event: GazeInteractionObjectFixationInEvent) => void;
	fixationInStart: (event: GazeInteractionObjectFixationInEvent) => void;
}
