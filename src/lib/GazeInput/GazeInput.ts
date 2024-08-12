import type { ETHandlerMapping } from './GazeInputEvent.js';
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/GazeWindowCalibratorConfig.js';
import type { GazeInputConfig, GazeInputConfigWithFixations } from './GazeInputConfig.js';
import { Emitter } from '$lib/Emitter/Emitter.js';

/**
 * The base class for all input adapters in the main thread. Adapter-specific implementations are in the worker thread.
 * It has custom event handling for performance reasons.
 * @param config - Configuration object including the type of the adapter. Cannot be changed after instantiation.
 * @param worker - The worker thread for the adapter. Each type of adapter has its own implementations in the worker.
 * @param isConnected - The connected state of the adapter.
 */
export abstract class GazeInput<T extends GazeInputConfig> extends Emitter<ETHandlerMapping> {

	_isConnected: boolean = false;
	_isEmitting: boolean = false;
	_isWindowCalibrated: boolean = false;
	_isWindowCalibrationContested: boolean = false;
	_isDeviceCalibrated: boolean = false;

	sessionId: string | null = null;

	readonly config: T;

	constructor(config: T) {
		super();
		this.config = config;
	}

	get isConnected(): boolean { return this._isConnected }
	get isEmitting(): boolean { return this._isEmitting }
	get isWindowCalibrated(): boolean { return this._isWindowCalibrated }
	get isWindowCalibrationContested(): boolean { return this._isWindowCalibrationContested }
	get isDeviceCalibrated(): boolean { return this._isDeviceCalibrated }

	set isConnected(isConnected: boolean) { 
		this._isConnected = isConnected
		const event = { type: 'connect', timestamp: Date.now(), value: isConnected } as const
		this.emit("connect", event)
		this.emit('state', event)
	}

	protected set isEmitting(isEmitting: boolean) { 
		this._isEmitting = isEmitting
		const event = { type: 'emit', timestamp: Date.now(), value: isEmitting } as const
		this.emit("emit", event)
		this.emit('state', event)
	}

	protected set isWindowCalibrated(isWindowCalibrated: boolean) { 
		this._isWindowCalibrated = isWindowCalibrated
		const event = { type: 'windowCalibrated', timestamp: Date.now(), value: isWindowCalibrated } as const
		this.emit("windowCalibrated", event)
		this.emit('state', event)
	}

	protected set isWindowCalibrationContested(isWindowCalibrationContested: boolean) { 
		this._isWindowCalibrationContested = isWindowCalibrationContested
		const event = { type: 'windowCalibrationContested', timestamp: Date.now(), value: isWindowCalibrationContested } as const
		this.emit("windowCalibrationContested", event)
		this.emit('state', event)
	}

	protected set isDeviceCalibrated(isDeviceCalibrated: boolean) { 
		this._isDeviceCalibrated = isDeviceCalibrated
		const event = { type: 'calibrated', timestamp: Date.now(), value: isDeviceCalibrated } as const
		this.emit("calibrated", event)
		this.emit('state', event)
	}

	protected handleConnected(data: { sessionId: string }) {
		this.sessionId = data.sessionId;
        this.isConnected = true;
    }

    protected handleDisconnected() {
        if (!this.isConnected) return;
        this.isConnected = false;
        this.sessionId = null;
    }

    protected handleStopped() {
        if (!this.isEmitting) return;
        this.isEmitting = false;
    }

    protected handleStarted() {
        if (this.isEmitting) return;
        this.isEmitting = true;
    }

    protected handleWindowCalibrated() {
        this.isWindowCalibrated = true;
        this.isWindowCalibrationContested = false;
    }

    protected handleCalibrated() {
        this.isDeviceCalibrated = true;
    }

    protected handleError(data: { type: string, message: string }) {
		const event = { type: 'error', timestamp: Date.now(), value: data.message } as const
		this.emit("error", event)
		this.emit('state', event)
    }

	/**
	 * Needed for all event data to be emitted in each Input adapter.
	 * @returns A unique session ID.
	 */
	createSessionId(): string {
		return Date.now().toString() + Math.random().toString().slice(2, 8);
	}

	abstract connect(): Promise<void>;
	abstract disconnect(): Promise<void>;
	abstract calibrate(): Promise<void>;
	abstract send(msg: string): void;
	abstract setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): Promise<void>;
	abstract start(): Promise<void>;
	abstract stop(): Promise<void>;
}

export const isGazeInputWithFixations = (input: GazeInput<GazeInputConfig>): input is GazeInput<GazeInputConfigWithFixations> => {
	return input.config.fixationDetection !== 'none';
}

