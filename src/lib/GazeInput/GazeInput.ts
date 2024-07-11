import { GAZE_INPUT_EVENT_DATA, GAZE_INPUT_EVENT_MESSAGE } from './GazeInputEvent.js';
import type { GazeInputEvent, ETHandlerMapping } from './GazeInputEvent.js';
import type { ETWindowCalibratorConfigMouseEventFields, ETWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/ETWindowCalibratorConfig.js';
import type { GazeInputConfig } from './GazeInputConfig.js';

/**
 * The base class for all input adapters in the main thread. Adapter-specific implementations are in the worker thread.
 * It has custom event handling for performance reasons.
 * @param config - Configuration object including the type of the adapter. Cannot be changed after instantiation.
 * @param worker - The worker thread for the adapter. Each type of adapter has its own implementations in the worker.
 * @param isConnected - The connected state of the adapter.
 */
export abstract class GazeInput<T extends GazeInputConfig> {

	_isConnected: boolean = false;
	_isEmitting: boolean = false;
	_isWindowCalibrated: boolean = false;
	_isWindowCalibrationContested: boolean = false;
	_isDeviceCalibrated: boolean = false;
	handlers: Partial<Record<GazeInputEvent, { callback: (...args: unknown[]) => unknown, orderCategory: number }[]>> = {
		[GAZE_INPUT_EVENT_DATA]: [],
		[GAZE_INPUT_EVENT_MESSAGE]: []
	};

	sessionID: string | null = null;

	readonly config: T;

	constructor(config: T) {
		this.config = config;
	}

	get isConnected(): boolean { return this._isConnected }
	get isEmitting(): boolean { return this._isEmitting }
	get isWindowCalibrated(): boolean { return this._isWindowCalibrated }
	get isWindowCalibrationContested(): boolean { return this._isWindowCalibrationContested }
	get isDeviceCalibrated(): boolean { return this._isDeviceCalibrated }

	set isConnected(isConnected: boolean) { 
		this._isConnected = isConnected
		this.emit(GAZE_INPUT_EVENT_MESSAGE, { type: 'connect', timestamp: Date.now(), value: isConnected })
	}

	protected set isEmitting(isEmitting: boolean) { 
		this._isEmitting = isEmitting
		this.emit(GAZE_INPUT_EVENT_MESSAGE, { type: 'emit', timestamp: Date.now(), value: isEmitting })
	}

	protected set isWindowCalibrated(isWindowCalibrated: boolean) { 
		this._isWindowCalibrated = isWindowCalibrated
		this.emit(GAZE_INPUT_EVENT_MESSAGE, { type: 'windowCalibrated', timestamp: Date.now(), value: isWindowCalibrated })
	}

	protected set isWindowCalibrationContested(isWindowCalibrationContested: boolean) { 
		this._isWindowCalibrationContested = isWindowCalibrationContested
		this.emit(GAZE_INPUT_EVENT_MESSAGE, { type: 'windowCalibrationContested', timestamp: Date.now(), value: isWindowCalibrationContested })
	}

	protected set isDeviceCalibrated(isDeviceCalibrated: boolean) { 
		this._isDeviceCalibrated = isDeviceCalibrated
		this.emit(GAZE_INPUT_EVENT_MESSAGE, { type: 'calibrated', timestamp: Date.now(), value: isDeviceCalibrated })
	}

	protected handleConnected(data: any) {
		this.sessionID = data.sessionID;
        this.isConnected = true;
    }

    protected handleDisconnected() {
        if (!this.isConnected) return;
        this.isConnected = false;
        this.sessionID = null;
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
        this.emit('message', {
            type: 'error',
            timestamp: Date.now(),
            value: data.message
        });
    }

	/**
	 * Get whether gaze point data contains fixations information.
	 * @returns Whether gaze point data contains fixations information.
	 */
	get isEmittingFixations(): boolean {
		return this.config.fixationDetection !== 'none';
	}

	/**
	 * Register a handler for an event type.
	 * @param eventType - The event type, one of {@link GazeInputEvent}.
	 * @param handler - The handler function.
	 * @param orderCategory - The order category of the handler. Events are emitted in the order of the category.
	 * The order of data emitting is paramount for more complicated GazeInteractions.
	 * @returns The instance of the adapter.
	 */
	on<K extends GazeInputEvent>(eventType: K, handler: ETHandlerMapping[K], orderCategory: number = 0): this {
		this.handlers[eventType]?.push({ callback: handler as (...args: unknown[]) => unknown, orderCategory });
		this.handlers[eventType]?.sort((a, b) => a.orderCategory - b.orderCategory);
		return this;
	}

	/**
	 * Unregister a handler for an event type.
	 * @param eventType - The event type, one of {@link GazeInputEvent}.
	 * @param handler
	 */
	off<K extends GazeInputEvent>(eventType: K, handler: ETHandlerMapping[K]): void {
		this.handlers[eventType] = this.handlers[eventType]?.filter((h) => h.callback !== handler);
	}

	/**
	 * Emit an event.
	 * @param eventType - The event type, one of {@link GazeInputEvent}.
	 * @param args
	 */
	emit<K extends GazeInputEvent>(eventType: K, ...args: Parameters<ETHandlerMapping[K]>): void {
		(this.handlers[eventType] as ({ callback: (...args: unknown[]) => unknown, orderCategory: number }[])).forEach((handler) =>
			handler.callback(...args)
		);
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
	abstract setWindowCalibration(mouseEvent: ETWindowCalibratorConfigMouseEventFields, window: ETWindowCalibratorConfigWindowFields): Promise<void>;
	abstract start(): Promise<void>;
	abstract stop(): Promise<void>;
}
