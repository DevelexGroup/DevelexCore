import type { GazeInputConfigBridge } from "./GazeInputConfig";
import { createGazeWindowCalibrator, type GazeWindowCalibratorConfigMouseEventFields, type GazeWindowCalibratorConfigWindowFields } from "../GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { GazeInput } from "./GazeInput";
import type { FixationDataPoint, GazeDataPoint } from "$lib/GazeData/GazeData";

// Inlining the worker is necessary for the worker to be created by Vite.
import BridgeWebWorker from '$lib/GazeInput/GazeInputBridge.worker.ts?worker&inline';
import type { InnerCommandPayloadBase, InnerCommandType, ReceiveErrorPayload, ReceiveMessagePayload, ReceiveResponsePayload, SendToWorkerAsyncMessages, ViewportCalibrationPayload } from "./GazeInputBridge.types";
import { createISO8601Timestamp } from "$lib/utils/timeUtils";

/**
 * Default timeout for requests in milliseconds.
 * After this duration, pending promises will be rejected.
 */
const REQUEST_TIMEOUT_MS = 25000; // 25 seconds

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
        reject: (reason?: unknown) => void,
        timeout: number
    }> = new Map();
    private correlationId: number = 0;

    /**
     * Bound handler for `message` events from the worker. Keeps the same switch logic that was previously
     * defined inline in the constructor so that we can add and remove the listener cleanly.
     */
    private readonly handleWorkerMessage = (
        event: MessageEvent<
            | GazeDataPoint
            | FixationDataPoint
            | ReceiveResponsePayload
            | ReceiveErrorPayload
            | ReceiveMessagePayload
            | ViewportCalibrationPayload
            | InnerCommandPayloadBase
        >
    ) => {
        const { type } = event.data;

        switch (type) {
            case 'gaze':
                this.emit('inputData', event.data);
                break;
            case 'fixationEnd':
                this.emit('inputFixationEnd', event.data);
                break;
            case 'fixationStart':
                this.emit('inputFixationStart', event.data);
                break;
            case 'response':
                this.processMessageResponse(event.data as ReceiveResponsePayload);
                break;
            case 'viewportCalibration':
                this.setWindowCalibrationValues(event.data as ViewportCalibrationPayload);
                this.resolvePendingPromise((event.data as ViewportCalibrationPayload).correlationId);
                break;
            case 'error':
                this.processMessageError(event.data as ReceiveErrorPayload);
                break;
            case 'message':
                this.processMessageMessage(event.data as ReceiveMessagePayload);
                break;
            case 'open':
            case 'close':
                this.resolvePendingPromise((event.data as InnerCommandPayloadBase).correlationId);
                break;
        }
    };

    /**
     * Bound handler for general worker errors so the bridge can surface them and reject all pending promises.
     */
    private readonly handleWorkerError = (event: ErrorEvent): void => {
        this.processMessageError({
            type: 'error',
            timestamp: createISO8601Timestamp(),
            content: event.message ?? 'Worker error',
        });
    };

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
        this.worker.addEventListener('message', this.handleWorkerMessage);
        this.worker.addEventListener('error', this.handleWorkerError);
    }

    /**
     * Create a correlation ID for the message.
     * @returns The correlation ID.
     */
    protected createCorrelationId(): number {
        return this.correlationId++;
    }

    /**
     * Process a response message from the worker.
     * @param data - The response message.
     */
    protected processMessageResponse(data: ReceiveResponsePayload): void {
        this.setStatusValues(data);
        if (data.response && data.response.status === 'resolved') {
            this.resolvePendingPromise(data.correlationId);
        } else if (data.response && data.response.status === 'rejected') {
            this.rejectPendingPromise(data.correlationId, data.response.message);
        } else if (data.response && data.response.status === 'processing') {
            return; // DO NOTHING, the promise is still pending
        } else {
            this.rejectPendingPromise(data.correlationId, new Error('Received an invalid response payload: ' + JSON.stringify(data)));
        }
    }

    /**
     * Process an error message from the worker. Reject all pending promises with the error.
     * @param data - The error message.
     */
    protected processMessageError(data: ReceiveErrorPayload): void {
        const hadPendingPromises = this.pendingPromises.size > 0;

        // Reject all command-level promises so their callers are notified.
        this.pendingPromises.forEach((_, correlationId) => {
            this.rejectPendingPromise(correlationId, data.content);
        });

        // Emit the global error only if *none* of the above rejections already did so.
        if (!hadPendingPromises) {
            this.emit('inputError', {
                type: 'inputError',
                timestamp: data.timestamp,
                content: data.content,
            });
        }
    }

    /**
     * Process a message message from the worker. Resolve the promise with the message.
     * @param data - The message.
     */
    protected processMessageMessage(data: ReceiveMessagePayload): void {
        this.resolvePendingPromise(data.correlationId);
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
        this.resolvePendingPromise(data.correlationId);
    }

    /**
     * Resolves a pending promise and cleans up associated resources.
     * @param correlationId - The correlation ID of the promise to resolve.
     */
    private resolvePendingPromise(correlationId: number): void {
        const promise = this.pendingPromises.get(correlationId);
        if (promise) {
            clearTimeout(promise.timeout);
            promise.resolve(this);
            this.pendingPromises.delete(correlationId);
        }
    }

    /**
     * Rejects a pending promise and cleans up associated resources.
     * @param correlationId - The correlation ID of the promise to reject.
     * @param reason - The reason for rejection.
     */
    private rejectPendingPromise(correlationId: number, reason?: unknown): void {
        const promise = this.pendingPromises.get(correlationId);
        if (promise) {
            clearTimeout(promise.timeout);
            promise.reject(reason);
            this.pendingPromises.delete(correlationId);
            // Propagate the error to all listeners so that local promise rejections
            // are visible at the global event level as well.
            const message = reason instanceof Error ? reason.message : String(reason);
            this.emit('inputError', {
                type: 'inputError',
                timestamp: createISO8601Timestamp(),
                content: message,
            });
        }
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
            // Create a timeout that will reject the promise if it's not resolved/rejected within REQUEST_TIMEOUT_MS
            const timeoutId = window.setTimeout(() => {
                this.rejectPendingPromise(correlationId, new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
            }, REQUEST_TIMEOUT_MS);

            // Store the promise handlers and timeout ID
            this.pendingPromises.set(correlationId, {
                resolve: resolve as (value: GazeInputBridge) => void,
                reject,
                timeout: timeoutId
            });

            // Send the message to the worker
            this.worker.postMessage(payload);
        });
    }

    /**
     * Terminates the worker and cleans up event listeners and pending promises.
     */
    async destroy(): Promise<this> {
        // Remove listeners to prevent memory leaks
        this.worker.removeEventListener('message', this.handleWorkerMessage);
        this.worker.removeEventListener('error', this.handleWorkerError);

        // Terminate worker thread
        this.worker.terminate();

        // Reject any still-pending promises so callers are informed
        this.pendingPromises.forEach((_, correlationId) => {
            this.rejectPendingPromise(correlationId, new Error('Bridge destroyed'));
        });
        this.pendingPromises.clear();

        return this;
    }
}