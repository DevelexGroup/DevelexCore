import type { GazeInputConfigBridge } from "./GazeInputConfig";
import { createETWindowCalibrator, type ETWindowCalibratorConfigMouseEventFields, type ETWindowCalibratorConfigWindowFields } from "../GazeWindowCalibrator/ETWindowCalibratorConfig";
import { GazeInput } from "./GazeInput";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";

/**
 * Class for the bridge input of remote eye trackers (e.g., Bridge).
 * Gaze data is received from the worker from WebSocket server and emitted here as messages.
 * Every parsing of the data and communication with eye-tracker is done in the worker for performance reasons.
 * This is a wrapper for the worker.
 */
export class GazeInputBridge extends GazeInput<GazeInputConfigBridge> {

    readonly worker: Worker;
    private messageHandlers: { [key: string]: Function } = {};

    constructor(config: GazeInputConfigBridge) {
        super(config);
        this.worker = new Worker(new URL('GazeInputBridgeWorker.ts', import.meta.url), {
            type: 'module'
        });
        this.worker.onmessage = (event) => {
            const { type, data } = event.data;
            const handler = this.messageHandlers[type];
            if (handler) {
                handler(data);
            }
        };
        this.addMessageHandler('point', (data: GazeDataPoint) => {
            this.emit('data', data);
        });
    }

    private addMessageHandler(type: string, handler: Function) {
        this.messageHandlers[type] = handler;
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
            this.addMessageHandler('connected', () => {
                this.sessionID = sessionId;
                this.isConnected = true;
                resolve();
            });
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
            this.addMessageHandler('disconnected', () => {
                this.isConnected = false;
                this.sessionID = null;
                resolve();
            });
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
            this.addMessageHandler('windowCalibrated', () => {
                this.isWindowCalibrated = true;
                this.isWindowCalibrationContested = false;
                resolve();
            });
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
            this.addMessageHandler('started', () => {
                this.isEmitting = true;
                resolve();
            });
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
            this.addMessageHandler('stopped', () => {
                this.isEmitting = false;
                resolve();
            });
        });
    }
}