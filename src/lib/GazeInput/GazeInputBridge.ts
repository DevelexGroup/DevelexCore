import type { GazeInputConfigBridge } from "./GazeInputConfig";
import { createGazeWindowCalibrator, type GazeWindowCalibratorConfigMouseEventFields, type GazeWindowCalibratorConfigWindowFields } from "../GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { GazeInput } from "./GazeInput";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";

// Inlining the worker is necessary for the worker to be created by Vite.
import BridgeWebWorker from '$lib/GazeInput/GazeInputBridge.worker.ts?worker&inline';
import type { InnerCommandPayloadBase, InnerCommandType, ReceiveErrorPayload, ReceiveMessagePayload, ReceiveResponsePayload, SendToWorkerAsyncMessages, ViewportCalibrationPayload } from "./GazeInputBridge.types";
import { createISO8601Timestamp } from "$lib/utils/timeUtils";

/**
 * Class for the bridge input of remote eye trackers (e.g., Bridge).
 * Gaze data is received from the worker from WebSocket server and emitted here as messages.
 * Every parsing of the data and communication with eye-tracker is done in the worker for performance reasons.
 * This is a wrapper for the worker.
 */
export class GazeInputBridge extends GazeInput<GazeInputConfigBridge> {

    readonly worker: Worker;
    private workerReady: Promise<void>;
    private pendingPromises: Map<number, { 
        resolve: (value: GazeInputBridge) => void, 
        reject: (reason?: unknown) => void 
    }> = new Map();
    private correlationId: number = 0;

    constructor(config: GazeInputConfigBridge) {
        super(config);
        this.worker = new BridgeWebWorker();
        
        // Simple one-time listener for the worker to be ready.
        this.workerReady = new Promise((resolve) => {
            this.worker.addEventListener('message', ({ data }) => {
                if (data.type === 'ready') {
                    resolve();
                }
            }, { once: true });
        });

        // Send a one-time message to the worker to set it up (set the URI + fixation detection method).
        this.worker.postMessage({
            type: 'setup',
            initiatorId: this.inputId,
            config: this.config,
        });

        // Set up permanent listener for messages from the worker.
        this.worker.onmessage = (event: MessageEvent<GazeDataPoint | ReceiveResponsePayload | ReceiveErrorPayload | ReceiveMessagePayload | ViewportCalibrationPayload | InnerCommandPayloadBase>) => {
            const { type } = event.data;
            
            switch (type) {
                case 'gaze':
                    this.processMessageGaze(event.data);
                    break;
                case 'response':
                    this.processMessageResponse(event.data);
                    break;
                case 'viewportCalibration':
                    this.setWindowCalibrationValues(event.data);
                    this.pendingPromises.get(event.data.correlationId)?.resolve(this);
                    break;
                case 'error': {
                    this.processMessageError(event.data);
                    break;
                }
                case 'message':
                    this.processMessageMessage(event.data);
                    break;
                case 'open':
                case 'close':
                    this.pendingPromises.get(event.data.correlationId)?.resolve(this);
                    break;
            }
        };
    }

    /**
     * Create a correlation ID for the message.
     * @returns The correlation ID.
     */
    protected createCorrelationId(): number {
        return this.correlationId++;
    }

    /**
     * Process a gaze data message from the worker.
     * @param data - The gaze data.
     */
    protected processMessageGaze(data: GazeDataPoint): void {
        this.emit('inputData', data);
    }

    /**
     * Process a response message from the worker.
     * @param data - The response message.
     */
    protected processMessageResponse(data: ReceiveResponsePayload): void {
        this.setStatusValues(data);
        if (data.response.status === 'resolved') {
            this.pendingPromises.get(data.correlationId)?.resolve(this);
        } else if (data.response.status === 'rejected') {
            this.pendingPromises.get(data.correlationId)?.reject(data.response.message);
        }
    }

    /**
     * Process an error message from the worker. Reject all pending promises with the error.
     * @param data - The error message.
     */
    protected processMessageError(data: ReceiveErrorPayload): void {
        this.pendingPromises.forEach((promise) => promise.reject(data.content));
        this.emit('inputError', {
            type: 'inputError',
            timestamp: data.timestamp,
            content: data.content,
        });
    }

    /**
     * Process a message message from the worker. Resolve the promise with the message.
     * @param data - The message.
     */
    protected processMessageMessage(data: ReceiveMessagePayload): void {
        this.pendingPromises.get(data.correlationId)?.resolve(this);
        this.emit('inputMessage', {
            type: 'inputMessage',
            timestamp: data.timestamp,
            content: data.content,
            fromInitiator: data.initiatorId,
        });
    }

    /**
     * Process a viewport calibration message from the worker. Set the window calibration values and resolve the promise.
     * @param data - The viewport calibration message.
     */
    protected processMessageViewportCalibration(data: ViewportCalibrationPayload): void {
        this.setWindowCalibrationValues(data);
        this.pendingPromises.get(data.correlationId)?.resolve(this);
    }

    subscribe(): Promise<this> {
        return this.sendGenericCommand('subscribe');
    }

    unsubscribe(): Promise<this> {
        return this.sendGenericCommand('unsubscribe');
    }

    refreshStatus(): Promise<this> {
        return this.sendGenericCommand('response');
    }

    start(): Promise<this> {
        return this.sendGenericCommand('start');
    }

    stop(): Promise<this> {
        return this.sendGenericCommand('stop');
    }

    connect(): Promise<this> {
        const config = {
            trackerType: this.config.tracker,
        };
        return this.send({
            type: 'connect',
            initiatorId: this.inputId,
            correlationId: this.createCorrelationId(),
            config,
        });
    }

    disconnect(): Promise<this> {
        return this.sendGenericCommand('disconnect');
    }

    calibrate(): Promise<this> {
        return this.sendGenericCommand('calibrate');
    }

    open(): Promise<this> {
        return this.sendGenericCommand('open');
    }

    close(): Promise<this> {
        return this.sendGenericCommand('close');
    }

    status(): Promise<this> {
        return this.sendGenericCommand('status');
    }

    message(content: string): Promise<this> {
        const correlationId = this.createCorrelationId();
        return this.send({
            type: 'message',
            correlationId,
            initiatorId: this.inputId,
            content,
        });
    }

    async setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): Promise<this> {
        const viewportCalibration = createGazeWindowCalibrator(mouseEvent, window);
        const correlationId = this.createCorrelationId();
        return this.send({
            type: 'viewportCalibration',
            correlationId,
            initiatorId: this.inputId,
            ...viewportCalibration,
        });
    }

    protected sendGenericCommand(commandType: Exclude<InnerCommandType, 'connect'>): Promise<this> {
        return this.send({
            type: commandType,
            correlationId: this.createCorrelationId(),
            initiatorId: this.inputId,
            timestamp: createISO8601Timestamp(),
        });
    }

    protected async send(payload: SendToWorkerAsyncMessages): Promise<this> {
        await this.workerReady;
        const correlationId = payload.correlationId;
        return new Promise<this>((resolve, reject) => {
            this.pendingPromises.set(correlationId, { resolve: resolve as (value: GazeInputBridge) => void, reject });
            this.worker.postMessage(payload);
        });
    }
}