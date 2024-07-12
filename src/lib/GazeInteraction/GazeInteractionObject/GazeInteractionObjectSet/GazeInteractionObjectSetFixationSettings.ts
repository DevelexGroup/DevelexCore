import type { GazeInteractionObjectInFixationEvent } from "./GazeInteractionObjectSetFixationEvent";
import type { GazeInteractionFixationSettings, GazeInteractionObjectFixationListener, GazeInteractionObjectFixationPayload } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationSettings";

/**
 * Listener object for GazeInteractionFixation.
 * @property {GazeInteractionInFixationSettings} settings for the listener, including the fixation time and callbacks.
 * @extends GazeInteractionObjectFixationListener
 */
export interface GazeInteractionObjectInFixationListener extends GazeInteractionObjectFixationListener {
	settings: GazeInteractionInFixationSettings;
}

/**
 * Payload object for GazeInteractionFixation.
 * @property {GazeInteractionScreenFixationEvent} listener The fixation event data.
 * @extends GazeInteractionObjectFixationPayload
 */
export interface GazeInteractionObjectInFixationPayload extends GazeInteractionObjectFixationPayload {
	listener: GazeInteractionObjectInFixationListener;
}

/**
 * Needed for the fixation event listener setup.
 * @property {number} bufferSize The time in milliseconds that the user must fixation on an element to trigger the event.
 * @property {GazeInteractionFixationCallbackType} onFixationProgress The callback function to be called when the user has been fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationEnd The callback function to be called when the user starts fixationing on an element.
 * @property {GazeInteractionFixationCallbackType} onFixationStart The callback function to be called when the user ends fixationing on an element.
 */
export interface GazeInteractionInFixationSettings extends GazeInteractionFixationSettings {
	fixationSetProgress: (event: GazeInteractionObjectInFixationEvent) => void;
	fixationSetEnd: (event: GazeInteractionObjectInFixationEvent) => void;
	fixationSetStart: (event: GazeInteractionObjectInFixationEvent) => void;
}
