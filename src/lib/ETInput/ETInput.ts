import { ET_EVENT_CONNECTED, ET_EVENT_DATA, ET_EVENT_MESSAGE } from '../ETEvent.js';
import type { ETEvent, ETHandlerMapping } from '../ETEvent.js';
import type { ETWindowCalibratorConfigMouseEventFields, ETWindowCalibratorConfigWindowFields } from '../ETWindowCalibrator/ETWindowCalibratorConfig.js';
import type { ETInputConfig } from './ETInputConfig.js';

/**
 * The base class for all input adapters in the main thread. Adapter-specific implementations are in the worker thread.
 * It has custom event handling for performance reasons.
 * @param config - Configuration object including the type of the adapter. Cannot be changed after instantiation.
 * @param worker - The worker thread for the adapter. Each type of adapter has its own implementations in the worker.
 * @param isConnected - The connected state of the adapter.
 */
export abstract class ETInput<T extends ETInputConfig> {
	readonly config: T;

	constructor(config: T) {
		this.config = config;
	}

	isConnected: boolean = false;
	isEmitting: boolean = false;
	isWindowCalibrated: boolean = false;
	isWindowCalibrationContested: boolean = false;
	isDeviceCalibrated: boolean = false;

	/**
	 * Get whether gaze point data contains fixations information.
	 * @returns Whether gaze point data contains fixations information.
	 */
	get isEmittingFixations(): boolean {
		return this.config.fixationDetection !== 'none';
	}

	handlers: Partial<Record<ETEvent, ((...args: unknown[]) => unknown)[]>> = {
		[ET_EVENT_CONNECTED]: [],
		[ET_EVENT_DATA]: [],
		[ET_EVENT_MESSAGE]: []
	};

	sessionID: string | null = null;

	/**
	 * Register a handler for an event type.
	 * @param eventType - The event type, one of {@link ETEvent}.
	 * @param handler - The handler function.
	 * @returns The instance of the adapter.
	 */
	on<K extends ETEvent>(eventType: K, handler: ETHandlerMapping[K]): this {
		this.handlers[eventType]?.push(handler as (...args: unknown[]) => unknown);
		return this;
	}

	/**
	 * Unregister a handler for an event type.
	 * @param eventType - The event type, one of {@link ETEvent}.
	 * @param handler
	 */
	off<K extends ETEvent>(eventType: K, handler: ETHandlerMapping[K]): void {
		this.handlers[eventType] = this.handlers[eventType]?.filter((h) => h !== handler);
	}

	/**
	 * Emit an event.
	 * @param eventType - The event type, one of {@link ETEvent}.
	 * @param args
	 */
	emit<K extends ETEvent>(eventType: K, ...args: Parameters<ETHandlerMapping[K]>): void {
		(this.handlers[eventType] as ((...args: unknown[]) => void)[]).forEach((handler) =>
			handler(...args)
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
