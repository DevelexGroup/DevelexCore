import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInteractionObjectValidationEventEnd, GazeInteractionObjectValidationEventProgress, GazeInteractionObjectValidationEventStart } from "./GazeInteractionObjectValidationEvent";

/**
 * Listener object for GazeInteractionObjectValidation
 * @property {GazeInteractionObjectValidationSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectValidationListener {
	settings: GazeInteractionObjectValidationSettings;
	element: Element;
}

export interface GazeInteractionObjectValidationPayload {
	data: GazeDataPoint;
	listener: GazeInteractionObjectValidationListener;
}

/**
 * Needed for the validation event listener setup.
 */
export interface GazeInteractionObjectValidationSettings {
    accuracyTolerance: number;
    validationDuration: number;
    onValidationStart: (event: GazeInteractionObjectValidationEventStart) => void;
    onValidationProgress: (event: GazeInteractionObjectValidationEventProgress) => void;
    onValidationEnd: (event: GazeInteractionObjectValidationEventEnd) => void;
}
