// export event type GazeInputEventType = "connected" | "disconnected" | "gazeData";
// in form of enum


import type {GazeDataPoint} from "../GazeData/GazeData.js";

export type GazeInputEventState = GazeInputEventStateBools | GazeInputEventStateMessage;

export interface GazeInputEventStateBools {
    type: "connect" | "emit" | "windowCalibrated" | "windowCalibrationContested" | "calibrated";
    timestamp: number;
    value: boolean;
};

export interface GazeInputEventStateBoolsConnect extends GazeInputEventStateBools {
    type: "connect";
};

export interface GazeInputEventStateBoolsEmit extends GazeInputEventStateBools {
    type: "emit";
};

export interface GazeInputEventStateBoolsWindowCalibrated extends GazeInputEventStateBools {
    type: "windowCalibrated";
};

export interface GazeInputEventStateBoolsWindowCalibrationContested extends GazeInputEventStateBools {
    type: "windowCalibrationContested";
};

export interface GazeInputEventStateBoolsCalibrated extends GazeInputEventStateBools {
    type: "calibrated";
};

export interface GazeInputMessage {
    type: string;
    timestamp: number;
    value: any;
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
    "windowCalibrated": GazeInputEventStateBoolsWindowCalibrated;
    "windowCalibrationContested": GazeInputEventStateBoolsWindowCalibrationContested;
    "calibrated": GazeInputEventStateBoolsCalibrated;
    "message": GazeInputEventStateMessage;
    "error": GazeInputEventStateMessageError;
};