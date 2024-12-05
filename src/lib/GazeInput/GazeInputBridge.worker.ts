import type { GazeInputConfigBridge } from "./GazeInputConfig";
import { createGazeWindowCalibrator, type GazeWindowCalibratorConfigMouseEventFields, type GazeWindowCalibratorConfigWindowFields } from "../GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { GazeInput } from "./GazeInput";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";

// Inlining the worker is necessary for the worker to be created by Vite.
import BridgeWebWorker from '$lib/GazeInput/GazeInputBridgeWorker.ts?worker&inline';
import type { CommandType, GazeDataPayload, ReceiveErrorPayload, ReceiveMessagePayload, ReceiveStatusPayload, SendToWorkerAsyncMessages, SendToWorkerMessages, SetupPayload, ViewportCalibrationPayload } from "./GazeInputBridge.types";
import { GazeWindowCalibrator } from "$lib/GazeWindowCalibrator/GazeWindowCalibrator";
import type { GazeFixationDetector } from "$lib/GazeFixationDetector/GazeFixationDetector";
import { createGazeFixationDetector } from "$lib/GazeFixationDetector";

/**
 * Worker thread for the bridge input.
 * It starts and ends the connection with the WebSocket server on subscribe and unsubscribe messages.
 * It also sets up the gaze window calibrator AND fixation detector on setup message.
 */

let setupPayload: SetupPayload | null = null;
let gazeWindowCalibrator: GazeWindowCalibrator | null = null;
let fixationDetector: GazeFixationDetector | null = null;
let gazeDataProcessor: (data: GazeDataPayload) => void = () => {
    console.warn('No gaze data processor set up.');
};

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
        case 'unsubscribe':
        case 'connect':
        case 'disconnect':
        case 'calibrate':
        case 'start':
        case 'stop':
        case 'status':
        case 'message':
            break;
    }
});

const setupInitialisation = (incomingSetupPayload: SetupPayload) => {
    setupPayload = incomingSetupPayload;
    const { config } = setupPayload;
    fixationDetector = createGazeFixationDetector(config.fixationDetection);
    self.postMessage({ type: 'ready' });
}

const setupViewportCalibration = (incomingViewportCalibrationPayload: ViewportCalibrationPayload) => {
    gazeWindowCalibrator = new GazeWindowCalibrator(incomingViewportCalibrationPayload);
    self.postMessage(incomingViewportCalibrationPayload);
}

/**
 * WORK IN PROGRESS
 */


