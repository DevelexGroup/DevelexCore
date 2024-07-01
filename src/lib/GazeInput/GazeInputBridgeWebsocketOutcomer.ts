/**
 * GazeInputBridgeWebsocketOutcomers are messages sent from the worker to the Python Bridge server.
 * The messages contain either commands to the eye tracker or configuration data.
 */
export type GazeInputBridgeWebsocketOutcomer = GazeInputBridgeWebsocketOutcomerConnect | GazeInputBridgeWebsocketOutcomerDisconnect;

export type GazeInputBridgeWebsocketOutcomerConnect = GazeInputBridgeWebsocketOutcomerConnectOpenGaze | GazeInputBridgeWebsocketOutcomerConnectSMI;

export type GazeInputBridgeWebsocketOutcomerConnectBase = {
    type: 'connect';
};

export type GazeInputBridgeWebsocketOutcomerConnectOpenGaze = GazeInputBridgeWebsocketOutcomerConnectBase & {
    tracker: 'opengaze';
    keepFixations: boolean;
};

export type GazeInputBridgeWebsocketOutcomerConnectSMI = GazeInputBridgeWebsocketOutcomerConnectBase & {
    tracker: 'smi';
};

export type GazeInputBridgeWebsocketOutcomerDisconnect = {
    type: 'disconnect';
};