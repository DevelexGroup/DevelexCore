import type { GazeInputConfigGazePoint } from "./GazeInputConfig";
import { createETWindowCalibrator, type ETWindowCalibratorConfigMouseEventFields, type ETWindowCalibratorConfigWindowFields } from "../GazeWindowCalibrator/ETWindowCalibratorConfig";
import { GazeInput } from "./GazeInput";

/**
 * Class for the bridge input of remote eye trackers (e.g., GazePoint).
 * Gaze data is received from the worker from WebSocket server and emitted here as messages.
 * Every parsing of the data and communication with eye-tracker is done in the worker for performance reasons.
 * This is a wrapper for the worker.
 */
export class GazeInputBridge extends GazeInput<GazeInputConfigGazePoint> {

    readonly worker: Worker;

    constructor(config: GazeInputConfigGazePoint) {
        super(config);
        this.worker = new Worker(new URL('GazeInputBridgeWorker.ts', import.meta.url), {
            type: 'module'
        });
    }

    /**
     * Triggers the worker to connect to the WebSocket server (DeveLex Bridge).
     * @returns resolved promise after receiving the open event from the WebSocket and the worker confirms the connection via a message.
     */
    connect(): Promise<void> {
        const sessionId = this.createSessionId();
        this.worker.postMessage({
            messageType: 'connect',
            data: {
                config: this.config,
                sessionId
            }
        });
        return new Promise<void>((resolve) => {
            this.worker.onmessage = (event) => {
                const { type } = event.data;
                if (type === 'connected') {
                    this.sessionID = sessionId;
                    this.isConnected = true;
                    resolve();
                }
            };
        });
    }

    /**
     * Triggers the worker to disconnect from the WebSocket server.
     * @returns resolved promise after receiving the close event from the WebSocket and the worker confirms the disconnection via a message.
     */
    disconnect(): Promise<void> {
        this.worker.postMessage({
            messageType: 'disconnect',
            data: {
                sessionId: this.sessionID
            }
        });
        return new Promise<void>((resolve) => {
            this.worker.onmessage = (event) => {
                const { type } = event.data;
                if (type === 'disconnected') {
                    this.isConnected = false;
                    this.sessionID = null;
                    resolve();
                }
            };
        });
    }

    calibrate(): Promise<void> {
        return Promise.resolve();
    }

    send(msg: string): void {
        console.log(msg);
    }

    setWindowCalibration(mouseEvent: ETWindowCalibratorConfigMouseEventFields, window: ETWindowCalibratorConfigWindowFields): Promise<void> {
        this.worker.postMessage({
            messageType: 'setWindowCalibration',
            data: {
                windowConfig: createETWindowCalibrator(mouseEvent, window),
            }
        });
        return new Promise<void>((resolve) => {
            this.worker.onmessage = (event) => {
                const { messageType } = event.data;
                if (messageType === 'windowCalibrated') {
                    this.isWindowCalibrated = true;
                    this.isWindowCalibrationContested = false;
                    resolve();
                }
            };
        });
    }

    start(): Promise<void> {
        this.worker.postMessage({
            messageType: 'start',
            data: {
                sessionId: this.sessionID
            }
        });
        return new Promise<void>((resolve) => {
            this.worker.onmessage = (event) => {
                const { type } = event.data;
                if (type === 'started') {
                    this.isEmitting = true;
                    resolve();
                }
            };
        });
    }

    stop(): Promise<void> {
        this.worker.postMessage({
            messageType: 'stop',
            data: {
                sessionId: this.sessionID
            }
        });
        return new Promise<void>((resolve) => {
            this.worker.onmessage = (event) => {
                const { type } = event.data;
                if (type === 'stopped') {
                    this.isEmitting = false;
                    resolve();
                }
            };
        });
    }
}