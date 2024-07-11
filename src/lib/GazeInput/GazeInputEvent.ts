// export event type GazeInputEventType = "connected" | "disconnected" | "gazeData";
// in form of enum


import type {GazeDataPoint} from "../GazeData/GazeData.js";

export type GazeInputMessage = GazeInputStateBools | GazeInputStateMessage;

export type GazeInputStateBools = {
    type: "connect" | "emit" | "windowCalibrated" | "windowCalibrationContested" | "calibrated";
    timestamp: number;
    value: boolean;
};

export type GazeInputStateMessage = {
    type: "error" | "message";
    timestamp: number;
    value: string;
};

/**
 * GazeInputEventType is the TS type for the event types emitted by the classes that implement {@link ETAdapter} interface.
 * It is just a string literal type that can be used to check the type of the event.
 * @category Event
 */

export type GazeInputEvent = typeof GAZE_INPUT_EVENT_DATA | typeof GAZE_INPUT_EVENT_MESSAGE;

/**
 * Constant for the event type emitted when the eye tracker sends new data.
 * See
 */
export const GAZE_INPUT_EVENT_DATA = "data";

/**
 * Constant for the event type emitted when the eye tracker sends a message.
 */
export const GAZE_INPUT_EVENT_MESSAGE = "message";

export type ETHandlerMapping = {
    [GAZE_INPUT_EVENT_DATA]: GazeDataPoint;
    [GAZE_INPUT_EVENT_MESSAGE]: GazeInputMessage;
};

