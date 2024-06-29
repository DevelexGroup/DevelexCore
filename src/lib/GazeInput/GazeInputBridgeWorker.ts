/**
 * Worker thread for the GazeInputBridge.
 */

import type { GazeInputConfigGazePoint } from './GazeInputConfig';
import type { ETWindowCalibratorConfig } from '../ETWindowCalibrator/ETWindowCalibratorConfig';
import { ETWindowCalibrator } from '../ETWindowCalibrator/ETWindowCalibrator';
import type { GazeDataPoint, GazePayload, GazePayloadPoint } from '../GazeData/GazeData';
import type { GazeFixationDetector } from '../GazeFixationDetector/GazeFixationDetector';
import { createGazeFixationDetector } from '../GazeFixationDetector';

const erroneousGazePointProcessor = (data: GazePayloadPoint) => {
    throw new Error('Gaze point processor is not set. Received data: ' + JSON.stringify(data));
}

let config: GazeInputConfigGazePoint | null = null;
let sessionId: string | null = null;
let socket: WebSocket | null = null;
let gazePointProcessor: (data: GazePayloadPoint) => void = erroneousGazePointProcessor;
let isPaused = true;
let windowCalibrator: ETWindowCalibrator | null = null;

/**
 * Bridge between main thread and worker thread.
 * Communicates with the DeveLex Bridge WebSocket server written in Python.
 */

self.onmessage = (event) => {
    const { messageType, data } = event.data;
    switch (messageType) {
        case 'connect':
            config = data.config as GazeInputConfigGazePoint;
            handleConnect(config, data.sessionId);
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

const handleConnect = (config: GazeInputConfigGazePoint, newSessionId: string) => {
    socket = new WebSocket(config.uri);
    sessionId = newSessionId;
    if (!config) {
        throw new Error('Config is null');
    }
    if (!windowCalibrator) {
        throw new Error('Window calibrator is null');
    }
    const fixationDetector = createGazeFixationDetector(config.fixationDetection);
    gazePointProcessor = generateGazePointProcessor(windowCalibrator, fixationDetector, sessionId);

    socket.onopen = () => {
        self.postMessage({ messageType: 'connected' });
    };

    socket.onmessage = (event) => {
        processWebsocketMessage(event);
    };

    socket.onerror = (error) => {
        self.postMessage({ messageType: 'error', data: error });
    };
}

const handleDisconnect = () => {
    if (!socket) {
        throw new Error('Socket is null');
    }
    socket.close();
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
    self.postMessage({ messageType: 'windowCalibrated' });
}

/**
 * Processes the message received from the WebSocket server.
 * It can be calibration data or gaze data.
 * @param event contains the message from the WebSocket server in form of JSON.
 */
const processWebsocketMessage = (event: MessageEvent) => {
    const attributes = JSON.parse(event.data) as GazePayload;
    switch (attributes.type) {
        case 'point':
            if (isPaused) {
                return;
            }
            gazePointProcessor(attributes as GazePayloadPoint);
            break;
        default:
            throw new Error('Unknown message type. Received data: ' + JSON.stringify(attributes));
    }   
}

export const generateGazePointProcessor = (windowCalibrator: ETWindowCalibrator, fixationDetector: GazeFixationDetector, sessionId: string) => {
    return (data: GazePayloadPoint) => {
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