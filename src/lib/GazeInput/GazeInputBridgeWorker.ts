/**
 * Worker thread for the GazeInputBridge.
 */

import type { GazeInputConfigBridge } from './GazeInputConfig';
import type { GazeWindowCalibratorConfig } from '../GazeWindowCalibrator/GazeWindowCalibratorConfig';
import { GazeWindowCalibrator } from '../GazeWindowCalibrator/GazeWindowCalibrator';
import type { GazeDataPoint } from '../GazeData/GazeData';
import type { GazeInputBridgeWebsocketIncomer, GazeInputBridgeWebsocketIncomerDisconnected, GazeInputBridgeWebsocketIncomerPoint } from "./GazeInputBridgeWebsocketIncomer";
import type { GazeFixationDetector } from '../GazeFixationDetector/GazeFixationDetector';
import { createGazeFixationDetector } from '../GazeFixationDetector';
import { GazeInputBridgeWebsocket } from './GazeInputBridgeWebsocket';
import type {GazeInputBridgeWebsocketOutcomerConnect } from './GazeInputBridgeWebsocketOutcomer';

let config: GazeInputConfigBridge | null = null;
let sessionId: string | null = null;
let socket: GazeInputBridgeWebsocket | null = null;
let windowCalibrator: GazeWindowCalibrator | null = null;
let fixationDetector: GazeFixationDetector | null = null;

/**
 * Bridge between main thread and worker thread.
 * Communicates with the DeveLex Bridge WebSocket server written in Python.
 */

self.onmessage = (event) => {
    const { messageType, data } = event.data;
    console.log('Worker received message', messageType, data);
    switch (messageType) {
        case 'connect':
            config = data.config as GazeInputConfigBridge;
            sendConnect(config, data.sessionId);
            break;
        case 'disconnect':
            handleDisconnect();
            break;
        case 'start':
            if (socket) {
                socket.send({ type: 'start' });
            }
            break;
        case 'stop':
            if (socket) {
                socket.send({ type: 'stop' });
            }
            break;
        case 'calibrate':
            if (socket) {
                socket.send({ type: 'calibrate' });
            }
            break;
        case 'setWindowCalibration':
            handleSetWindowCalibration(data as {
                windowConfig: GazeWindowCalibratorConfig,
                config: GazeInputConfigBridge
            });
            break;
        default:
            throw new Error('Unknown message type');
    }
};

const sendConnect = (config: GazeInputConfigBridge, newSessionId: string) => {
    if (!config) {
        throw new Error('Config is null');
    }
    if (!windowCalibrator) {
        throw new Error('Window calibrator is null');
    }
    if (socket) socket.close();

    sessionId = newSessionId;
    fixationDetector = createGazeFixationDetector(config.fixationDetection);

    socket = new GazeInputBridgeWebsocket(config.uri);
    socket.onPointCallback = generateBridgeProcessor(windowCalibrator, fixationDetector, sessionId);
    socket.onConnectedCallback = generateConnectMessage(sessionId);
    socket.onDisconnectedCallback = generateDisconnectMessage; // disconnects the socket and sets sessionId to null
    socket.onErrorCallback = generateMessage;
    socket.onCalibratedCallback = generateMessage;
    socket.onStartedCallback = generateMessage;
    socket.onStoppedCallback = generateMessage;

    const connectMessage: GazeInputBridgeWebsocketOutcomerConnect = config.tracker === 'opengaze' ? {
        type: 'connect',
        tracker: config.tracker,
        sessionId,
        keepFixations: config.fixationDetection === 'device',
    } : {
        type: 'connect',
        tracker: config.tracker,
        sessionId,
    };

    socket.send(connectMessage);
}

const handleDisconnect = () => {
    if (!socket) throw new Error('Socket is null');
    socket.send({ type: 'disconnect' });
}

/**
 * Actual last piece of the puzzle that allows the worker to emit valid gaze points.
 * It will set up the gazePointProcessor function with the correct window calibration and configuration.
 * @param config for the window calibration.
 */
const handleSetWindowCalibration = ({ windowConfig }: { windowConfig: GazeWindowCalibratorConfig }) => {
    windowCalibrator = new GazeWindowCalibrator(windowConfig);
    if (socket && sessionId && fixationDetector) {
        socket.onPointCallback = generateBridgeProcessor(windowCalibrator, fixationDetector, sessionId);
    }
    self.postMessage({ type: 'windowCalibrated' });
}

const generateBridgeProcessor = (
    windowCalibrator: GazeWindowCalibrator,
    fixationDetector: GazeFixationDetector,
    sessionId: string,
    postMessage: (data: GazeDataPoint) => void = generatePointMessage
) => {
    return (data: GazeInputBridgeWebsocketIncomerPoint) => {

        data.xL = Number(data.xL);
        data.xR = Number(data.xR);
        data.yL = Number(data.yL);
        data.yR = Number(data.yR);
        data.timestamp = Number(data.timestamp);

        const windowXL = windowCalibrator.toWindowX(data.xL);
        const windowXR = windowCalibrator.toWindowX(data.xR);
        const windowYL = windowCalibrator.toWindowY(data.yL);
        const windowYR = windowCalibrator.toWindowY(data.yR);

        const { x, y } = getGazeDataPointCenter(data);
        const windowX = windowCalibrator.toWindowX(x);
        const windowY = windowCalibrator.toWindowY(y);

        const windowCalibratedData: GazeDataPoint = { 
            ...data,
            x: windowX,
            xL: windowXL,
            xR: windowXR,
            xLScreenRelative: data.xL,
            xRScreenRelative: data.xR,
            y: windowY,
            yL: windowYL,
            yR: windowYR,
            yLScreenRelative: data.yL,
            yRScreenRelative: data.yR,
            sessionId,
            parseValidity: true // can be disvalidated by (i) fixation detector or (ii) window coordinates decorrelation in main thread wrapper
        };
        const fixation = fixationDetector.processGazePoint(windowCalibratedData);
        postMessage(fixation);
    }
}

const generatePointMessage = (data: GazeDataPoint) => {
    self.postMessage({ type: 'point', data });
}

const generateDisconnectMessage = (data: GazeInputBridgeWebsocketIncomerDisconnected) => {
    console.log('Disconnected', data);
    sessionId = null;
    generateMessage(data);
}

const generateConnectMessage = (sessionId: string) => {
    return () => {
        self.postMessage({ type: 'connected', data: { sessionId } });
    }
}

const generateMessage = (data: GazeInputBridgeWebsocketIncomer) => {
    self.postMessage({ type: data.type, data });
}

export const getGazeDataPointCenter = (point: GazeInputBridgeWebsocketIncomerPoint): { x: number; y: number } => {
    if (point.validityL && point.validityR) {
        return {
            x: (point.xL + point.xR) / 2,
            y: (point.yL + point.yR) / 2
        };
    } else if (point.validityL) {
        return {
            x: point.xL,
            y: point.yL
        };
    } else if (point.validityR) {
        return {
            x: point.xR,
            y: point.yR
        };
    } else {
        return {
            x: 0,
            y: 0
        };
    }
}