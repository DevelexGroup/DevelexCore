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
            console.log(type, data);
            const handler = this.messageHandlers[type];
            if (handler) {
                handler(data);
            } else {
                console.error('Unknown message type:', event);
            }
        };
        this.initMessageHandlers();
    }

    private initMessageHandlers() {
        this.addMessageHandler('point', (data: GazeDataPoint) => this.emit('data', data));
        this.addMessageHandler('error', this.handleError.bind(this));
        this.addMessageHandler('disconnected', this.handleDisconnected.bind(this));
        this.addMessageHandler('stopped', this.handleStopped.bind(this));
        this.addMessageHandler('connected', this.handleConnected.bind(this));
        this.addMessageHandler('calibrated', this.handleCalibrated.bind(this));
        this.addMessageHandler('windowCalibrated', this.handleWindowCalibrated.bind(this));
        this.addMessageHandler('started', this.handleStarted.bind(this));
    }

    protected addMessageHandler(type: string, handler: Function) {
        this.messageHandlers[type] = handler;
    }

    /**
     * Triggers the worker to connect to the WebSocket server (DeveLex Bridge).
     * @returns resolved promise after receiving the open event from the WebSocket and the worker confirms the connection via a message.
     */
    async connect(): Promise<void> {
        if (this.isConnected) return Promise.resolve();
        return this.createCommand(
            'connect',
            { config: this.config, sessionId: this.createSessionId() },
            'connected',
            this.handleConnected.bind(this)
        );
    }

    /**
     * Triggers the worker to disconnect from the WebSocket server.
     * @returns resolved promise after receiving the close event from the WebSocket and the worker confirms the disconnection via a message.
     */
    async disconnect(): Promise<void> {
        if (!this.isConnected) return Promise.resolve()
        if (this.isEmitting) {
            try {
                await this.stop();
            } catch (error) {
                return Promise.reject(error);
            }
        } 
        return this.createCommand(
            'disconnect',
            { sessionId: this.sessionID },
            'disconnected',
            this.handleDisconnected.bind(this)
        );
    }

    async calibrate(): Promise<void> {
        if (!this.sessionID) {
            this.handleError({ type: 'error', message: 'Not connected.' });
            return Promise.reject('Not connected.');
        }
        return this.createCommand(
            'calibrate',
            { sessionId: this.sessionID },
            'calibrated',
            this.handleCalibrated.bind(this)
        );
    }

    send(msg: string): void {
        console.log(msg);
    }

    async setWindowCalibration(mouseEvent: ETWindowCalibratorConfigMouseEventFields, window: ETWindowCalibratorConfigWindowFields): Promise<void> {
        return this.createCommand(
            'setWindowCalibration',
            { windowConfig: createETWindowCalibrator(mouseEvent, window), config: this.config },
            'windowCalibrated',
            this.handleWindowCalibrated.bind(this)
        );
    }

    async start(): Promise<void> {
        if (this.isEmitting) return Promise.resolve();
        if (!this.sessionID) {
            this.handleError({ type: 'error', message: 'Not connected.' });
            return Promise.reject('Not connected.');
        }
        return this.createCommand(
            'start',
            { sessionId: this.sessionID },
            'started',
            this.handleStarted.bind(this)
        );
    }

    async stop(): Promise<void> {
        if (!this.isEmitting) return Promise.resolve();
        if (!this.sessionID) {
            this.handleError({ type: 'error', message: 'Not connected.' });
            return Promise.reject('Not connected.');
        }
        return this.createCommand(
            'stop',
            { sessionId: this.sessionID },
            'stopped',
            this.handleStopped.bind(this)
        );
    }

    createCommand = (
        messageType: string,
        data: Object,
        successMessage: string, 
        updateState: Function
    ): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            this.worker.postMessage({
                messageType,
                data
            });
            const successHandler = (data: any) => {
                updateState(data);
                resolve();
            };
            this.addMessageHandler(successMessage, (data: any) => successHandler(data));
            this.addMessageHandler('error', (data: { type: string, message: string }) => {
                this.handleError(data);
                reject(data.message);
            });
        });
    };
}