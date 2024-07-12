import type { GazeInteractionObjectFixationInEvent } from "./GazeInteractionObjectSetFixationEvent";
import type { GazeInteractionFixationSettings, GazeInteractionObjectFixationListener, GazeInteractionObjectFixationPayload } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationSettings";

/**
 * Listener object for GazeInteractionFixation.
 * @property {GazeInteractionFixationInSettings} settings for the listener, including the fixation time and callbacks.
 * @extends GazeInteractionObjectFixationListener
 */
export interface GazeInteractionObjectFixationInListener extends GazeInteractionObjectFixationListener {
	settings: GazeInteractionFixationInSettings;
}

/**
 * Payload object for GazeInteractionFixation.
 * @property {GazeInteractionScreenFixationEvent} listener The fixation event data.
 * @extends GazeInteractionObjectFixationPayload
 */
export interface GazeInteractionObjectFixationInPayload extends GazeInteractionObjectFixationPayload {
	listener: GazeInteractionObjectFixationInListener;
}

/**
 * Needed for the fixation event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must fixation on an element to trigger the event.
 * @property {GazeInteractionFixationCallbackType} onFixationProgress The callback function to be called when the user has been fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationEnd The callback function to be called when the user starts fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationStart The callback function to be called when the user ends fixationing on an element.
 */
export interface GazeInteractionFixationInSettings extends GazeInteractionFixationSettings {
	fixationInProgress: (event: GazeInteractionObjectFixationInEvent) => void;
	fixationInEnd: (event: GazeInteractionObjectFixationInEvent) => void;
	fixationInStart: (event: GazeInteractionObjectFixationInEvent) => void;
}
