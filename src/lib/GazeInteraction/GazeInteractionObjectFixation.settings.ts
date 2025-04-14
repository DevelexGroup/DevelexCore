import { FixationDataPoint } from "$lib/GazeData/GazeData.js";
import type { GazeInteractionObjecListener, GazeInteractionObjectListenerPayload } from "./GazeInteractionObject.settings.js";
import type { GazeInteractionObjectFixationEvent } from "./GazeInteractionObjectFixation.event.js";


/**
 * Listener object for GazeInteractionFixation.
 * @property {GazeInteractionObjectFixationSettings} Settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */

export interface GazeInteractionObjectFixationListener extends GazeInteractionObjecListener {
	settings: GazeInteractionObjectFixationSettings;
	element: Element;
}

export interface GazeInteractionObjectFixationPayload extends GazeInteractionObjectListenerPayload {
	data: FixationDataPoint;
	listener: GazeInteractionObjectFixationListener;
}

/**
 * Needed for the fixation event listener Objectup.
 * @property {number} bufferSize The time in milliseconds that the user must fixation on an element to trigger the event.
 * @property {(event: GazeInteractionObjectFixationProgressEvent) => void} onFixationProgress The callback function to be called when the user has been fixationing on an element.
 * @property {(event: GazeInteractionObjectFixationEndEvent) => void} onFixationEnd The callback function to be called when the user starts fixationing on an element.
 * @property {(event: GazeInteractionObjectFixationStartEvent) => void} onFixationStart The callback function to be called when the user ends fixationing on an element.
 */
export interface GazeInteractionObjectFixationSettings {
	bufferSize: number;
	fixationObjectProgress: (event: GazeInteractionObjectFixationEvent) => void;
	fixationObjectEnd: (event: GazeInteractionObjectFixationEvent) => void;
	fixationObjectStart: (event: GazeInteractionObjectFixationEvent) => void;
}