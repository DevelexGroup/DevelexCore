import type { FixationDataPoint, GazeDataPoint } from "$lib/GazeData/GazeData";

// Inlining the worker is necessary for the worker to be created by Vite.
import type { GazeDataPayload, ReceiveErrorPayload, ReceiveFromWorkerMessages, ReceiveMessagePayload, ReceiveResponsePayload, SendToWorkerAsyncMessages, SendToWorkerMessages, SetupPayload, ViewportCalibrationPayload, InnerCommandPayloadBase, FixationDataPayload } from "./GazeInputBridge.types";
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
let fixationDataProcessor: (data: FixationDataPayload) => void = () => {
    console.warn('No fixation data processor set up.');
};
/* let isSubscribed = false; */

apiClient.on('gaze', (data: GazeDataPayload) => {
    gazeDataProcessor(data);
});

apiClient.on('fixationStart', (data: FixationDataPayload) => {
    fixationDataProcessor(data);
});

apiClient.on('fixationEnd', (data: FixationDataPayload) => {
    fixationDataProcessor(data);
});

apiClient.on('error', (data: ReceiveErrorPayload) => {
    if (data.content.startsWith('Failed to parse WebSocket message')) {
        sendToTheMainThread({ ...data, content: `[JS201] ${data.content}` });
    } else {
        sendToTheMainThread({ ...data, content: `[BR100] ${data.content}` });
    }
});

apiClient.on('response', (data: ReceiveResponsePayload) => {
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
        case 'open':
            openWebSocket(event.data);
            break;
        case 'close':
            closeWebSocket(event.data);
            break;
        case 'subscribe':
        case 'unsubscribe':
        case 'connect':
        case 'disconnect':
        case 'calibrate':
        case 'start':
        case 'stop':
        case 'response':
        case 'message':
        case 'status':
            transmitToWebSocket(event.data);
            break;
    }
});

const sendFixationDataToTheMainThread = (data: FixationDataPayload) => {
    sendToTheMainThread(data);
}

const setupInitialisation = (incomingSetupPayload: SetupPayload) => {
    setupPayload = incomingSetupPayload;
    const { config, initiatorId } = setupPayload;
    if (fixationDetector) {
        fixationDetector.reset();
        fixationDetector.off('fixationStart', sendFixationDataToTheMainThread);
        fixationDetector.off('fixationEnd', sendFixationDataToTheMainThread);
    }
    fixationDetector = createGazeFixationDetector(config.fixationDetection);
    fixationDetector.on('fixationStart', sendFixationDataToTheMainThread);
    fixationDetector.on('fixationEnd', sendFixationDataToTheMainThread);
    sendToTheMainThread({ type: 'ready', initiatorId });
}

const setupViewportCalibration = (incomingViewportCalibrationPayload: ViewportCalibrationPayload) => {
    gazeWindowCalibrator = new GazeWindowCalibrator(incomingViewportCalibrationPayload);
    self.postMessage(incomingViewportCalibrationPayload);
}

const createBridgeGazeSampleProcessor = (
    windowCalibrator: GazeWindowCalibrator,
    fixationDetector: GazeFixationDetector,
    sessionId: string,
) => {
    return (data: GazeDataPayload) => {

        data.xL = Number(data.xL);
        data.xR = Number(data.xR);
        data.yL = Number(data.yL);
        data.yR = Number(data.yR);
        // dont convert data.timestamp to number, it is a ISO date-time

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
        sendToTheMainThread(windowCalibratedData);
        fixationDetector.processGazePoint(windowCalibratedData);
    }
}

const createBridgeFixationSampleProcessor = (
    windowCalibrator: GazeWindowCalibrator,
    fixationDetector: GazeFixationDetector,
    sessionId: string,
) => {
    return (data: FixationDataPayload) => {

        const windowFixationPoint: Omit<FixationDataPoint, 'fixationId'> = {
            ...data,
            x: windowCalibrator.toWindowX(data.x),
            y: windowCalibrator.toWindowY(data.y),
            xScreenRelative: data.x,
            yScreenRelative: data.y,
            sessionId,
            parseValidity: true
        };

        fixationDetector.processFixationPoint(windowFixationPoint);
    }
}

const setupWebSocket = async () => {
    // check first if we have a valid setup payload
    if (!setupPayload) {
        sendWorkerErrorToTheMainThread('[JS001] No setup payload found.', null);
        return false;
    }
    if (!gazeWindowCalibrator) {
        sendWorkerErrorToTheMainThread('[JS002] No gaze window calibrator found.', null);
        return false;
    }
    if (!fixationDetector) {
        sendWorkerErrorToTheMainThread('[JS003] No fixation detector found.', null);
        return false;
    }
    // prepare the gaze data processor
    gazeDataProcessor = createBridgeGazeSampleProcessor(gazeWindowCalibrator, fixationDetector, setupPayload.initiatorId);
    fixationDataProcessor = createBridgeFixationSampleProcessor(gazeWindowCalibrator, fixationDetector, setupPayload.initiatorId);

    try {
        // attempt to open the websocket connection
        await apiClient.openConnection(setupPayload.config.uri);
    } catch {
        sendWorkerErrorToTheMainThread(
            `[JS101] Failed to connect to WebSocket server at ${setupPayload.config.uri}`,
            null
        );
        return false;
    }
    return true;
}

const openWebSocket = async (openPayload: InnerCommandPayloadBase) => {
    const isSetup = await setupWebSocket();
    if (!isSetup) {
        return;
    }
    // send back the open payload with the correct correlationId
    sendToTheMainThread({ type: 'open', correlationId: openPayload.correlationId, initiatorId: openPayload.initiatorId, timestamp: createISO8601Timestamp() });
}

const closeWebSocket = (closePayload: InnerCommandPayloadBase) => {
    apiClient.closeConnection();
    // send back the close payload with the correct correlationId
    sendToTheMainThread({ type: 'close', correlationId: closePayload.correlationId, initiatorId: closePayload.initiatorId, timestamp: createISO8601Timestamp() });
}

const transmitToWebSocket = (payload: SendToWorkerAsyncMessages) => {
    try {
        if (!setupPayload) {
            sendWorkerErrorToTheMainThread('[JS001] Cannot send message: Bridge not set up.', createISO8601Timestamp(), payload.correlationId);
            return;
        }

        // Validate payload before sending
        if (!payload.type || !payload.initiatorId) {
            sendWorkerErrorToTheMainThread('[JS203] Invalid message payload: missing required fields.', createISO8601Timestamp(), payload.correlationId);
            return;
        }

        apiClient.send(payload);
    } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        sendWorkerErrorToTheMainThread(`[JS102] Failed to send message to Bridge: ${reason}`, createISO8601Timestamp(), payload.correlationId);
    }
}

const sendToTheMainThread = (payload: ReceiveFromWorkerMessages | InnerCommandPayloadBase) => {
    self.postMessage(payload);
}

const sendWorkerErrorToTheMainThread = (message: string, timestamp: string | null, correlationId?: number) => {
    sendToTheMainThread({ type: 'error', content: message, timestamp: timestamp ?? createISO8601Timestamp(), correlationId });
}

/* const sendNotSubscribedErrorToTheMainThread = (correlationId: number, initiatorId: string) => {
    sendWorkerErrorToTheMainThread('Not subscribed to the WebSocket server.', correlationId, initiatorId);
} */
/**
 * WORK IN PROGRESS
 */

// vite export
export {};

