import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInteractionEvents } from "../GazeInteraction";
import type { GazeInteractionEvent } from "../GazeInteractionEvent";

export type GazeInteractionObjectValidationEvents = {
    'validation': GazeInteractionObjectValidationEvent,
} & GazeInteractionEvents;

export interface GazeInteractionObjectValidationEvent extends GazeInteractionEvent {
    validationDuration: number;
    type: 'validation';
    isValid: boolean;
    allDataPointsCount: number;
    validDataPointsCount: number;
    validDataPointsPercentage: number;
    accuracy: number; // in pixels
    precision: number; // in pixels
    gazeDataPoints: GazeDataPoint[];
}