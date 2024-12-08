import type { GazeInputEvents } from './GazeInputEvent.js';
import type { GazeWindowCalibratorConfig, GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/GazeWindowCalibratorConfig.js';
import type { GazeInputConfig, GazeInputConfigWithFixations } from './GazeInputConfig.js';
import { Emitter } from '$lib/Emitter/Emitter.js';
import type { ReceiveResponsePayload } from './GazeInputBridge.types.js';
import { createISO8601Timestamp } from '$lib/utils/timeUtils.js';

/**
 * The base class for all input adapters in the main thread. Adapter-specific implementations are in the worker thread.
 * It has custom event handling for performance reasons.
 * @param config - Configuration object including the type of the adapter. Cannot be changed after instantiation.
 * @param worker - The worker thread for the adapter. Each type of adapter has its own implementations in the worker.
 * @param isConnected - The connected state of the adapter.
 */
export abstract class GazeInput<T extends GazeInputConfig> extends Emitter<GazeInputEvents> {

	_windowCalibration: GazeWindowCalibratorConfig | null = null;
	_lastStatus: ReceiveResponsePayload | null = null;
	inputId: string;

	readonly config: T;

	constructor(config: T, inputId: string | null = null) {
		super();
		this.config = config;
		this.inputId = inputId ?? this.createSessionId();
	}

	get windowCalibration(): GazeWindowCalibratorConfig | null { return this._windowCalibration }
	get lastStatus(): ReceiveResponsePayload | null { return this._lastStatus }

	/**
	 * Needed for all event data to be emitted in each Input adapter.
	 * @returns A unique session ID.
	 */
	createSessionId(): string {
		return Date.now().toString() + Math.random().toString().slice(2, 8);
	}

	abstract refreshStatus(): Promise<this>;
	abstract connect(): Promise<this>; // TODO: rename to setTracker() ?
	abstract disconnect(): Promise<this>; // TODO: rename to unsetTracker() ?
	abstract calibrate(): Promise<this>;
	abstract message(content: string): Promise<this>;
	abstract setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): Promise<this>;
	abstract start(): Promise<this>;
	abstract stop(): Promise<this>;
	abstract subscribe(): Promise<this>;
	abstract unsubscribe(): Promise<this>;

	protected setWindowCalibrationValues(calibration: GazeWindowCalibratorConfig | null) {
		this._windowCalibration = calibration;
		this.emit('inputState', {
			type: 'inputState',
			timestamp: createISO8601Timestamp(),
			viewportCalibration: calibration,
			trackerStatus: this._lastStatus
		});
	}

	protected setStatusValues(status: ReceiveResponsePayload | null) {
		this._lastStatus = status;
		this.emit('inputState', {
			type: 'inputState',
			timestamp: createISO8601Timestamp(),
			viewportCalibration: this._windowCalibration,
			trackerStatus: status
		});
	}
}

export const isGazeInputWithFixations = (input: GazeInput<GazeInputConfig>): input is GazeInput<GazeInputConfigWithFixations> => {
	return input.config.fixationDetection !== 'none';
}

