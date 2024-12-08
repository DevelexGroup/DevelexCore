import type { GazeDataPoint } from "$lib/GazeData/GazeData";

// Inlining the worker is necessary for the worker to be created by Vite.
import type { CommandPayloadGeneric, GazeDataPayload, ReceiveErrorPayload, ReceiveFromWorkerMessages, ReceiveMessagePayload, ReceiveStatusPayload, SendToWorkerAsyncMessages, SendToWorkerMessages, SetupPayload, ViewportCalibrationPayload } from "./GazeInputBridge.types";
import { GazeWindowCalibrator } from "$lib/GazeWindowCalibrator/GazeWindowCalibrator";
import type { GazeFixationDetector } from "$lib/GazeFixationDetector/GazeFixationDetector";
import { createGazeFixationDetector } from "$lib/GazeFixationDetector";
import { createISO8601Timestamp } from "$lib/utils/timeUtils";
import { GazeInputBridgeApiClient } from "./GazeInputBridgeApiClient";
import { getGazeDataPointCenter } from '../utils/gazeUtils';

/**
 * Worker thread for the bridge input.
 * It starts and ends the connection with the WebSocket server on subscribe and unsubscribe messages.
 * It also sets up the gaze window calibrator AND fixation detector on setup message.
 */
const apiClient = new GazeInputBridgeApiClient();
let setupPayload: SetupPayload | null = null;
let gazeWindowCalibrator: GazeWindowCalibrator | null = null;
let fixationDetector: GazeFixationDetector | null = null;
let gazeDataProcessor: (data: GazeDataPayload) => void = () => {
    console.warn('No gaze data processor set up.');
};
let isSubscribed = false;

apiClient.on('gaze', (data: GazeDataPayload) => {
    gazeDataProcessor(data);
});

apiClient.on('error', (data: ReceiveErrorPayload) => {
    sendToTheMainThread(data);
});

apiClient.on('status', (data: ReceiveStatusPayload) => {
    sendToTheMainThread(data);
});

apiClient.on('message', (data: ReceiveMessagePayload) => {
    sendToTheMainThread(data);
});

self.addEventListener('message', (event: MessageEvent<SendToWorkerMessages>) => {
    const { type } = event.data;
    switch (type) {
        case 'setup':
            setupInitialisation(event.data);
            break;
        case 'viewportCalibration':
            setupViewportCalibration(event.data);
            break;
        case 'subscribe':
            setupWebSocket(event.data);
            break;
        case 'unsubscribe':
            closeWebSocket(event.data);
            break;
        case 'connect':
        case 'disconnect':
        case 'calibrate':
        case 'start':
        case 'stop':
        case 'status':
        case 'message':
            transmitToWebSocket(event.data);
            break;
    }
});

const setupInitialisation = (incomingSetupPayload: SetupPayload) => {
    setupPayload = incomingSetupPayload;
    const { config, initiatorId } = setupPayload;
    fixationDetector = createGazeFixationDetector(config.fixationDetection);
    sendToTheMainThread({ type: 'ready', initiatorId });
}

const setupViewportCalibration = (incomingViewportCalibrationPayload: ViewportCalibrationPayload) => {
    gazeWindowCalibrator = new GazeWindowCalibrator(incomingViewportCalibrationPayload);
    self.postMessage(incomingViewportCalibrationPayload);
}

const createBridgeProcessor = (
    windowCalibrator: GazeWindowCalibrator,
    fixationDetector: GazeFixationDetector,
    sessionId: string,
    postMessage: (data: GazeDataPoint) => void
) => {
    return (data: GazeDataPayload) => {

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
            parseValidity: true, // can be disvalidated by (i) fixation detector
            pupilDiameterL: data.pupilDiameterL,
            pupilDiameterR: data.pupilDiameterR
        };
        const fixation = fixationDetector.processGazePoint(windowCalibratedData);
        postMessage(fixation);
    }
}

const setupWebSocket = async (subscribePayload: CommandPayloadGeneric) => {
    // check first if we have a valid setup payload
    if (!setupPayload) {
        sendWorkerErrorToTheMainThread('No setup payload found.', subscribePayload.correlationId, subscribePayload.initiatorId);
        return;
    }
    if (!gazeWindowCalibrator) {
        sendWorkerErrorToTheMainThread('No gaze window calibrator found.', subscribePayload.correlationId, subscribePayload.initiatorId);
        return;
    }
    if (!fixationDetector) {
        sendWorkerErrorToTheMainThread('No fixation detector found.', subscribePayload.correlationId, subscribePayload.initiatorId);
        return;
    }
    // prepare the gaze data processor
    gazeDataProcessor = createBridgeProcessor(gazeWindowCalibrator, fixationDetector, setupPayload.initiatorId, sendToTheMainThread);
    
    try {
        // attempt to open the websocket connection
        await apiClient.openConnection(setupPayload.config.uri);
        // send the subscribe message
        apiClient.send(subscribePayload);
    } catch {
        sendWorkerErrorToTheMainThread(
            `Failed to connect to WebSocket server at ${setupPayload.config.uri}`,
            subscribePayload.correlationId,
            subscribePayload.initiatorId
        );
        return;
    }
}

const closeWebSocket = (unsubscribePayload: CommandPayloadGeneric) => {
    if (!isSubscribed) {
        sendNotSubscribedErrorToTheMainThread(unsubscribePayload.correlationId, unsubscribePayload.initiatorId);
        return;
    }
    isSubscribed = false;
    apiClient.send(unsubscribePayload);
    // TODO: close the websocket connection after the message is sent and received with the correct correlationId
}

const transmitToWebSocket = (payload: SendToWorkerAsyncMessages) => {
    if (!isSubscribed) {
        sendNotSubscribedErrorToTheMainThread(payload.correlationId, payload.initiatorId);
        return;
    }
    apiClient.send(payload);
}

const sendToTheMainThread = (payload: ReceiveFromWorkerMessages) => {
    self.postMessage(payload);
}

const sendWorkerErrorToTheMainThread = (message: string, correlationId: number, initiatorId: string) => {
    sendToTheMainThread({ type: 'error', content: message, correlationId, initiatorId, timestamp: createISO8601Timestamp() });
}

const sendNotSubscribedErrorToTheMainThread = (correlationId: number, initiatorId: string) => {
    sendWorkerErrorToTheMainThread('Not subscribed to the WebSocket server.', correlationId, initiatorId);
}
/**
 * WORK IN PROGRESS
 */

// vite export
export {};

