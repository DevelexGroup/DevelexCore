import type { GazeInteractionEvents } from "../GazeInteraction";
import type { GazeInteractionEvent } from "../GazeInteractionEvent";

export interface GazeInteractionObjectValidationEvents extends GazeInteractionEvents {
    'validationStart': GazeInteractionObjectValidationEventStart,
    'validationProgress': GazeInteractionObjectValidationEventProgress,
    'validationEnd': GazeInteractionObjectValidationEventEnd
}

export interface GazeInteractionObjectValidationEvent extends GazeInteractionEvent {
    validationDuration: number;
    progress: number; // 0-1
}

export interface GazeInteractionObjectValidationEventStart extends GazeInteractionObjectValidationEvent {
    type: 'validationStart';
    progress: 0;
}

export interface GazeInteractionObjectValidationEventProgress extends GazeInteractionObjectValidationEvent {
    type: 'validationProgress';
}

export interface GazeInteractionObjectValidationEventEnd extends GazeInteractionObjectValidationEvent {
    type: 'validationEnd';
    isValid: boolean;
    progress: 1;
    accuracy: number; // in pixels
    precision: number; // in pixels
}