/**
 * GazeInputBridgeWebsocketOutcomers are messages sent from the worker to the Python Bridge server.
 * The messages contain either commands to the eye tracker or configuration data.
 */
export type GazeInputBridgeWebsocketOutcomer = GazeInputBridgeWebsocketOutcomerConnect | GazeInputBridgeWebsocketOutcomerDisconnect | GazeInputBridgeWebsocketOutcomerStart | GazeInputBridgeWebsocketOutcomerStop | GazeInputBridgeWebsocketOutcomerCalibrate;

export type GazeInputBridgeWebsocketOutcomerConnect = GazeInputBridgeWebsocketOutcomerConnectOpenGaze | GazeInputBridgeWebsocketOutcomerConnectSMI | GazeInputBridgeWebsocketOutcomerConnectEyelogic;

export type GazeInputBridgeWebsocketOutcomerConnectBase = {
    type: 'connect';
    sessionId: string;
};

export type GazeInputBridgeWebsocketOutcomerConnectOpenGaze = GazeInputBridgeWebsocketOutcomerConnectBase & {
    tracker: 'opengaze';
    keepFixations: boolean;
};

export type GazeInputBridgeWebsocketOutcomerConnectSMI = GazeInputBridgeWebsocketOutcomerConnectBase & {
    tracker: 'smi';
};

export type GazeInputBridgeWebsocketOutcomerConnectEyelogic = GazeInputBridgeWebsocketOutcomerConnectBase & {
    tracker: 'eyelogic';
};

export type GazeInputBridgeWebsocketOutcomerDisconnect = {
    type: 'disconnect';
};

export type GazeInputBridgeWebsocketOutcomerStart = {
    type: 'start';
};

export type GazeInputBridgeWebsocketOutcomerStop = {
    type: 'stop';
};

export type GazeInputBridgeWebsocketOutcomerCalibrate = {
    type: 'calibrate';
};