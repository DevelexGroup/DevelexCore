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

	/**
	 * Get the current connected state.
	 * @returns True if connected, false otherwise.
	 * @readonly
	 * @emits connect - When the connected state changes.
	 * @emits state - When the connected state changes.
	 */
	get isConnected(): boolean { return this._isConnected }

	/**
	 * Get the current emitting state.
	 * @returns True if emitting, false otherwise.
	 * @readonly
	 * @emits emit - When the emitting state changes.
	 * @emits state - When the emitting state changes.
	 */
	get isEmitting(): boolean { return this._isEmitting }

	/**
	 * Get the current window calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits windowCalibrated - When the window calibration state changes.
	 * @emits state - When the window calibration state changes.
	 */
	get isWindowCalibrated(): boolean { return this._isWindowCalibrated }

	/**
	 * Get the current window calibration contested state.
	 * @returns True if contested, false otherwise.
	 * @readonly
	 * @emits windowCalibrationContested - When the window calibration contested state changes.
	 * @emits state - When the window calibration contested state changes.
	 */
	get isWindowCalibrationContested(): boolean { return this._isWindowCalibrationContested }

	/**
	 * Get the current device calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits calibrated - When the device calibration state changes.
	 * @emits state - When the device calibration state changes.
	 */ 
	get isDeviceCalibrated(): boolean { return this._isDeviceCalibrated }

	/**
	 * Set the connected state.
	 * @param isConnected - The connected state to set.
	 * @emits connect - When the connected state changes.
	 * @emits state - When the connected state changes.
	 */
	protected set isConnected(isConnected: boolean) { 
		this._isConnected = isConnected
		const event = { type: 'connect', timestamp: Date.now(), value: isConnected } as const
		this.emit("connect", event)
		this.emit('state', event)
	}

	/**
	 * Set the emitting state.
	 * @param isEmitting - The emitting state to set.
	 * @emits emit - When the emitting state changes.
	 * @emits state - When the emitting state changes.
	 */
	protected set isEmitting(isEmitting: boolean) { 
		this._isEmitting = isEmitting
		const event = { type: 'emit', timestamp: Date.now(), value: isEmitting } as const
		this.emit("emit", event)
		this.emit('state', event)
	}

	/**
	 * Set the window calibration state.
	 * @param isWindowCalibrated - The window calibration state to set.
	 * @emits windowCalibrated - When the window calibration state changes.
	 * @emits state - When the window calibration state changes.
	 */
	protected set isWindowCalibrated(isWindowCalibrated: boolean) { 
		this._isWindowCalibrated = isWindowCalibrated
		const event = { type: 'windowCalibrated', timestamp: Date.now(), value: isWindowCalibrated } as const
		this.emit("windowCalibrated", event)
		this.emit('state', event)
	}

	/**
	 * Set the window calibration contested state.
	 * @param isWindowCalibrationContested - The window calibration contested state to set.
	 * @emits windowCalibrationContested - When the window calibration contested state changes.
	 * @emits state - When the window calibration contested state changes.
	 */
	protected set isWindowCalibrationContested(isWindowCalibrationContested: boolean) { 
		this._isWindowCalibrationContested = isWindowCalibrationContested
		const event = { type: 'windowCalibrationContested', timestamp: Date.now(), value: isWindowCalibrationContested } as const
		this.emit("windowCalibrationContested", event)
		this.emit('state', event)
	}

	/**
	 * Set the device calibration state.
	 * @param isDeviceCalibrated - The device calibration state to set.
	 * @emits calibrated - When the device calibration state changes.
	 * @emits state - When the device calibration state changes.
	 */
	protected set isDeviceCalibrated(isDeviceCalibrated: boolean) { 
		this._isDeviceCalibrated = isDeviceCalibrated
		const event = { type: 'calibrated', timestamp: Date.now(), value: isDeviceCalibrated } as const
		this.emit("calibrated", event)
		this.emit('state', event)
	}

	/**
	 * Handle the connected event.
	 * @param data - The data of the event.
	 */
	protected handleConnected(data: { sessionId: string }) {
		this.sessionId = data.sessionId;
        this.isConnected = true;
    }

	/**
	 * Handle the disconnected event.
	 * @param data - The data of the event.
	 */ 
    protected handleDisconnected() {
        if (!this.isConnected) return;
        this.isConnected = false;
        this.sessionId = null;
    }

	/**
	 * Handle the stopped event.
	 * @param data - The data of the event.
	 */
    protected handleStopped() {
        if (!this.isEmitting) return;
        this.isEmitting = false;
    }

	/**
	 * Handle the started event.
	 * @param data - The data of the event.
	 */ 
    protected handleStarted() {
        if (this.isEmitting) return;
        this.isEmitting = true;
    }

	/**
	 * Handle the window calibration contested event.
	 * @param data - The data of the event.
	 */
    protected handleWindowCalibrated() {
        this.isWindowCalibrated = true;
        this.isWindowCalibrationContested = false;
    }

	/**
	 * Handle the window calibration contested event.
	 * @param data - The data of the event.
	 */
    protected handleCalibrated() {
        this.isDeviceCalibrated = true;
    }

	/**
	 * Handle the window calibration contested event.
	 * @param data - The data of the event.
	 */
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

