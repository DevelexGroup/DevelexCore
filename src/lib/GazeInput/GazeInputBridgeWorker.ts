/**
 * Worker thread for the GazeInputBridge.
 */

import type { GazeInputConfigGazePoint } from './GazeInputConfig';
import type { ETWindowCalibratorConfig } from '../GazeWindowCalibrator/ETWindowCalibratorConfig';
import { ETWindowCalibrator } from '../GazeWindowCalibrator/ETWindowCalibrator';
import type { GazeDataPoint } from '../GazeData/GazeData';
import type { GazeInputBridgeWebsocketIncomer, GazeInputBridgeWebsocketIncomerPoint } from "./GazeInputBridgeWebsocketIncomer";
import type { GazeFixationDetector } from '../GazeFixationDetector/GazeFixationDetector';
import { createGazeFixationDetector } from '../GazeFixationDetector';
import { GazeInputBridgeWebsocket } from './GazeInputBridgeWebsocket';
import type {GazeInputBridgeWebsocketOutcomerConnect } from './GazeInputBridgeWebsocketOutcomer';

let config: GazeInputConfigGazePoint | null = null;
let sessionId: string | null = null;
let socket: GazeInputBridgeWebsocket | null = null;
let windowCalibrator: ETWindowCalibrator | null = null;
let fixationDetector: GazeFixationDetector | null = null;

/**
 * Bridge between main thread and worker thread.
 * Communicates with the DeveLex Bridge WebSocket server written in Python.
 */

self.onmessage = (event) => {
    const { messageType, data } = event.data;
    switch (messageType) {
        case 'connect':
            config = data.config as GazeInputConfigGazePoint;
            sendConnect(config, data.sessionId);
            break;
        case 'disconnect':
            handleDisconnect();
            break;
        case 'setWindowCalibration':
            handleSetWindowCalibration(data as {
                windowConfig: ETWindowCalibratorConfig,
                config: GazeInputConfigGazePoint
            });
            break;
        default:
            throw new Error('Unknown message type');
    }
};

const sendConnect = (config: GazeInputConfigGazePoint, newSessionId: string) => {
    if (!config) {
        throw new Error('Config is null');
    }
    if (!windowCalibrator) {
        throw new Error('Window calibrator is null');
    }

    sessionId = newSessionId;
    fixationDetector = createGazeFixationDetector(config.fixationDetection);

    socket = new GazeInputBridgeWebsocket(config.uri);
    socket.onPointCallback = generateGazePointProcessor(windowCalibrator, fixationDetector, sessionId);
    socket.onConnectedCallback = generateOtherMessage;
    socket.onDisconnectedCallback = generateOtherMessage;
    socket.onErrorCallback = generateOtherMessage;
    socket.onCalibratedCallback = generateOtherMessage;

    const connectMessage: GazeInputBridgeWebsocketOutcomerConnect = config.tracker === 'opengaze' ? {
        type: 'connect',
        tracker: config.tracker,
        keepFixations: config.fixationDetection === 'device',
    } : {
        type: 'connect',
        tracker: config.tracker,
    };

    socket.send(connectMessage);
}

const handleDisconnect = () => {
    if (!socket) {
        throw new Error('Socket is null');
    }
    socket = null;
    sessionId = null;
    self.postMessage({ messageType: 'disconnected' });
}

/**
 * Actual last piece of the puzzle that allows the worker to emit valid gaze points.
 * It will set up the gazePointProcessor function with the correct window calibration and configuration.
 * @param config for the window calibration.
 */
const handleSetWindowCalibration = ({ windowConfig }: { windowConfig: ETWindowCalibratorConfig }) => {
    windowCalibrator = new ETWindowCalibrator(windowConfig);
    if (socket && sessionId && fixationDetector) {
        socket.onPointCallback = generateGazePointProcessor(windowCalibrator, fixationDetector, sessionId);
    }
    self.postMessage({ messageType: 'windowCalibrated' });
}

const generateGazePointProcessor = (windowCalibrator: ETWindowCalibrator, fixationDetector: GazeFixationDetector, sessionId: string) => {
    return (data: GazeInputBridgeWebsocketIncomerPoint) => {
        const windowX = windowCalibrator.toWindowX(data.x);
        const windowY = windowCalibrator.toWindowY(data.y);
        const windowCalibratedData: GazeDataPoint = { 
            ...data,
            x: windowX,
            y: windowY,
            xScreenRelative: data.x,
            yScreenRelative: data.y,
            sessionId,
            parseValidity: true // can be disvalidated by (i) fixation detector or (ii) window coordinates decorrelation in main thread wrapper
        };
        const fixation = fixationDetector.processGazePoint(windowCalibratedData);
        self.postMessage({ messageType: 'gazeData', data: fixation });
    }
}

const generateOtherMessage = (data: GazeInputBridgeWebsocketIncomer) => {
    self.postMessage({ type: data.type });
}