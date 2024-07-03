
/**
 * GazeInputBridgeWebsocketIncomer are messages sent from the Python Bridge server to the worker.
 * The messages contain either gaze data or status of the connection and the eye tracker.
 */
export type GazeInputBridgeWebsocketIncomer = GazeInputBridgeWebsocketIncomerPoint | GazeInputBridgeWebsocketIncomerConnected | GazeInputBridgeWebsocketIncomerDisconnected | GazeInputBridgeWebsocketIncomerError | GazeInputBridgeWebsocketIncomerCalibrated | GazeInputBridgeWebsocketIncomerStarted | GazeInputBridgeWebsocketIncomerStopped;

export type GazeInputBridgeWebsocketIncomerPoint = GazeInputBridgeWebsocketIncomerPointBase | GazeInputBridgeWebsocketIncomerFixation;

export type GazeInputBridgeWebsocketIncomerPointBase = {
    timestamp: number;
    type: 'point';
    x: number;
    y: number;
    deviceValidity: boolean;
};

export type GazeInputBridgeWebsocketIncomerFixation = GazeInputBridgeWebsocketIncomerPointBase & {
    fixationDuration: number;
    fixationId: number;
};

export type GazeInputBridgeWebsocketIncomerConnected = {
    type: 'connected';
};

export type GazeInputBridgeWebsocketIncomerDisconnected = {
    type: 'disconnected';
};

export type GazeInputBridgeWebsocketIncomerError = {
    type: 'error';
    message: string;
};

export type GazeInputBridgeWebsocketIncomerCalibrated = {
    type: 'calibrated';
};

export type GazeInputBridgeWebsocketIncomerStarted = {
    type: 'started';
};

export type GazeInputBridgeWebsocketIncomerStopped = {
    type: 'stopped';
};
