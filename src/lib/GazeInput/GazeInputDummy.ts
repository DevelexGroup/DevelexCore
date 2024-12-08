import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import { createGazeFixationDetector } from '$lib/GazeFixationDetector';
import type { GazeFixationDetector } from '$lib/GazeFixationDetector/GazeFixationDetector';
import { GazeInput } from '$lib/GazeInput/GazeInput';
import { GazeWindowCalibrator } from '../GazeWindowCalibrator/GazeWindowCalibrator';
import { createGazeWindowCalibrator, type GazeWindowCalibratorConfigMouseEventFields, type GazeWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/GazeWindowCalibratorConfig';
import type { GazeInputConfigDummy } from './GazeInputConfig';
import { createISO8601Timestamp } from '$lib/utils/timeUtils';

/**
 * Dummy input for testing purposes which does not require any hardware.
 * Mouse position is used as gaze input in the given frequency.
 * It has its precision and frequency configurable.
 */
export class GazeInputDummy extends GazeInput<GazeInputConfigDummy> {
	private readonly boundUpdateMousePosition: (event: MouseEvent) => void;
	private lastMouseCoordinates: { x: number; y: number } = { x: 0, y: 0 };
	private intervalId: number | null = null;
	private precisionError: number | null = null;
	private windowCalibrator: GazeWindowCalibrator | null = null;
	private fixationDetector: GazeFixationDetector | null = null;
	private correlationId: number = 0;

	constructor(config: GazeInputConfigDummy) {
		super(config);
		this.precisionError = config.precisionMinimalError;
		this.boundUpdateMousePosition = this.updateMousePosition.bind(this);
		this.fixationDetector = createGazeFixationDetector(config.fixationDetection);
	}

	protected createCorrelationId(): number {
		return this.correlationId++;
	}

	private async sendError(error: string): Promise<never> {
		await this.emit('inputError', {
			type: 'inputError',
			content: error,
			timestamp: createISO8601Timestamp()
		});
		return Promise.reject(new Error(error));
	}

	async connect(): Promise<this> {
		if (!this.windowCalibrator) {
			return this.sendError('Window calibrator is not set.');
		}

		document.addEventListener('mousemove', this.boundUpdateMousePosition);
		
		this.setStatusValues({
			type: 'status',
			status: 'trackerConnected',
			trackerCalibration: null,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'connect'
		});

		return this;
	}

	async start(): Promise<this> {
		if (!this.windowCalibrator || !this.fixationDetector) {
			return this.sendError('Window calibrator or fixation detector is not set.');
		}

		if (this._lastStatus?.status !== 'trackerConnected' && this._lastStatus?.status !== 'trackerEmitting') {
			return this.sendError('Cannot start: tracker is not connected.');
		}

		const interval = 1000 / this.config.frequency;
		this.intervalId = window.setInterval(() => {
			const { x, y } = this.calculateCoordinates();
			const gazePoint = this.createGazePoint(x, y);
			const processedPoint = this.fixationDetector!.processGazePoint(gazePoint);
			this.emit('inputData', processedPoint);
		}, interval);

		this.setStatusValues({
			type: 'status',
			status: 'trackerEmitting',
			trackerCalibration: null,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'start'
		});

		return this;
	}

	async stop(): Promise<this> {
		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}

		const nextStatus = this._lastStatus?.status === 'trackerEmitting' ? 'trackerConnected' : 'trackerDisconnected';
		const nextTrackerCalibration = this._lastStatus?.status ? this._lastStatus?.status : null;

		this.setStatusValues({
			type: 'status',
			status: nextStatus,
			trackerCalibration: nextTrackerCalibration,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'stop'
		});

		return this;
	}

	async disconnect(): Promise<this> {
		if (this.intervalId != null) {
			await this.stop();
		}
		document.removeEventListener('mousemove', this.boundUpdateMousePosition);

		this.setStatusValues({
			type: 'status',
			status: 'trackerDisconnected',
			trackerCalibration: null,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'disconnect'
		});

		return this;
	}

	async calibrate(): Promise<this> {
		const precisionError = this.config?.precisionMinimalError;
		if (precisionError) {
			this.precisionError = precisionError;
		}

		const previousStatus = this._lastStatus;
		if (!previousStatus) {
			return this.sendError('No previous status found.');
		}

		this.setStatusValues({
			type: 'status',
			status: 'trackerCalibrating',
			trackerCalibration: previousStatus.trackerCalibration,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'calibrate'
		});

		// wait for 1 second
		await new Promise(resolve => setTimeout(resolve, 1000));

		this.setStatusValues({
			type: 'status',
			status: 'trackerConnected',
			trackerCalibration: createISO8601Timestamp(),
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'calibrate'
		});

		return this;
	}

	async message(content: string): Promise<this> {
		this.emit('inputMessage', {
			type: 'inputMessage',
			content,
			timestamp: createISO8601Timestamp(),
			fromInitiator: this.inputId
		});
		return this;
	}

	async setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): Promise<this> {
		const calibrationConfig = createGazeWindowCalibrator(mouseEvent, window);
		this.windowCalibrator = new GazeWindowCalibrator(calibrationConfig);
		this.setWindowCalibrationValues(calibrationConfig);
		return this;
	}

	async subscribe(): Promise<this> {
		const nextStatus = this._lastStatus?.status ? this._lastStatus?.status : 'trackerDisconnected';
		const nextTrackerCalibration = this._lastStatus?.trackerCalibration ? this._lastStatus?.trackerCalibration : null;
		this.setStatusValues({
			type: 'status',
			status: nextStatus,
			trackerCalibration: nextTrackerCalibration,
			correlationId: this.createCorrelationId(),
			initiatorId: this.inputId,
			timestamp: createISO8601Timestamp(),
			responseTo: 'subscribe'
		});
		return this;
	}

	async unsubscribe(): Promise<this> {
		this.setStatusValues(null);
		return this;
	}

	async refreshStatus(): Promise<this> {
		if (this._lastStatus) {
			this.setStatusValues(this._lastStatus);
		}
		return this;
	}

	private updateMousePosition(event: MouseEvent): void {
		this.lastMouseCoordinates = { x: event.clientX, y: event.clientY };
	}

	private calculateCoordinates(): { x: number; y: number } {
		const x = this.simulateCoordinate(this.lastMouseCoordinates.x);
		const y = this.simulateCoordinate(this.lastMouseCoordinates.y);
		this.precisionError = Math.min(
			this.precisionError! + this.config.precisionDecayRate,
			this.config.precisionMaximumError
		);
		return { x, y };
	}

	private simulateCoordinate(coordinate: number): number {
		return coordinate + (Math.random() - 0.5) * 2 * (this.precisionError || 0);
	}

	private createGazePoint(x: number, y: number): GazeDataPoint {
		if (!this.windowCalibrator) {
			this.sendError('Window calibrator is not set.');
			throw new Error('Window calibrator is not set.');
		}

		const xScreenRelative = this.windowCalibrator.toScreenRelativeX(x);
		const yScreenRelative = this.windowCalibrator.toScreenRelativeY(y);

		return {
			x,
			xL: x,
			xR: x,
			xLScreenRelative: xScreenRelative,
			xRScreenRelative: xScreenRelative,
			y,
			yL: y,
			yR: y,
			yLScreenRelative: yScreenRelative,
			yRScreenRelative: yScreenRelative,
			sessionId: this.inputId,
			timestamp: Date.now(),
			validityL: true,
			validityR: true,
			parseValidity: true,
			type: 'gaze',
			pupilDiameterL: 0,
			pupilDiameterR: 0
		};
	}
}