import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInteractionObjectListenerPayload } from "./GazeInteractionObject.settings";
import type { GazeInteractionObjectValidationEvent} from "./GazeInteractionObjectValidation.event";

/**
 * Listener object for GazeInteractionObjectValidation
 * @property {GazeInteractionObjectValidationSettings} settings for the listener, including the fixation time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectValidationListener {
	settings: GazeInteractionObjectValidationSettings;
	element: Element;
    gazeDataPoints: GazeDataPoint[];
}

export interface GazeInteractionObjectValidationPayload extends GazeInteractionObjectListenerPayload {
	data: GazeDataPoint;
	listener: GazeInteractionObjectValidationListener;
}

/**
 * Needed for the validation event listener setup.
 */
export interface GazeInteractionObjectValidationSettings {
    accuracyTolerance: number;
    validationDuration: number;
    onValidation: (event: GazeInteractionObjectValidationEvent) => void;
}
