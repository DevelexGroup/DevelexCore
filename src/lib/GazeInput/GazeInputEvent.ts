import type {GazeDataPoint} from "../GazeData/GazeData.js";
import type { GazeWindowCalibratorConfig } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js";
import type { ReceiveResponsePayload } from "./GazeInputBridge.types.js";

export interface GazeInputEvent {
    type: keyof GazeInputEvents;
    timestamp: string; // ISO date-time
}

export interface GazeInputEventState extends GazeInputEvent {
    viewportCalibration: GazeWindowCalibratorConfig | null;
    trackerStatus: ReceiveResponsePayload | null;
}

export interface GazeInputEventMessage extends GazeInputEvent {
    content: string;
    fromInitiator: string;
}

export interface GazeInputEventError extends GazeInputEvent {
    content: string;
}

export type GazeInputEvents = {
    "inputData": GazeDataPoint;
    "inputState": GazeInputEventState;
    "inputMessage": GazeInputEventMessage;
    "inputError": GazeInputEventError;
};