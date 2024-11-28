// export event type GazeInputEventType = "connected" | "disconnected" | "gazeData";
// in form of enum


import type {GazeDataPoint} from "../GazeData/GazeData.js";
import type { GazeWindowCalibratorConfig } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js";

export type GazeInputEventState = GazeInputEventStateBools | GazeInputEventStateMessage | GazeInputEventStateCalibration;

export interface GazeInputEventStateBools {
    type: "connect" | "emit" | "calibrated";
    timestamp: number;
    value: boolean;
};

export interface GazeInputEventStateBoolsConnect extends GazeInputEventStateBools {
    type: "connect";
};

export interface GazeInputEventStateBoolsEmit extends GazeInputEventStateBools {
    type: "emit";
};

export interface GazeInputEventStateCalibration {
    type: "windowCalibrated";
    timestamp: number;
    value: GazeWindowCalibratorConfig | null;
};

export interface GazeInputEventStateBoolsCalibrated extends GazeInputEventStateBools {
    type: "calibrated";
};

export interface GazeInputMessage {
    type: string;
    timestamp: number;
    value: unknown;
};

export interface GazeInputEventStateMessage {
    type: "error" | "message";
    timestamp: number;
    value: string;
};

export interface GazeInputEventStateMessageError extends GazeInputEventStateMessage {
    type: "error";
};

export interface GazeInputEventStateMessageMessage extends GazeInputEventStateMessage {
    type: "message";
};


export type ETHandlerMapping = {
    "data": GazeDataPoint;
    "state": GazeInputEventState;
    "connect": GazeInputEventStateBoolsConnect;
    "emit": GazeInputEventStateBoolsEmit;
    "windowCalibrated": GazeInputEventStateCalibration;
    "calibrated": GazeInputEventStateBoolsCalibrated;
    "message": GazeInputEventStateMessage;
    "error": GazeInputEventStateMessageError;
};