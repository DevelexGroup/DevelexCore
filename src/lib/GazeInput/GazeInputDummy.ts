import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import { createGazeFixationDetector } from '$lib/GazeFixationDetector';
import type { GazeFixationDetector } from '$lib/GazeFixationDetector/GazeFixationDetector';
import { GazeInput } from '$lib/GazeInput/GazeInput';
import { GazeWindowCalibrator } from '../GazeWindowCalibrator/GazeWindowCalibrator';
import { createGazeWindowCalibrator, type GazeWindowCalibratorConfigMouseEventFields, type GazeWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/GazeWindowCalibratorConfig';
import type { GazeInputConfigDummy } from './GazeInputConfig';

/**
 * Dummy input for testing purposes which does not require any hardware.
 * Mouse position is used as gaze input in the given frequency.
 * It has its precision and frequency configurable.
 * TODO: Input classes simpler, more consistent, and more robust to handle high-frequency data.
 */
export class GazeInputDummy extends GazeInput<GazeInputConfigDummy> {
	private readonly boundUpdateMousePosition: (event: MouseEvent) => void;
	lastMouseCoordinates: { x: number; y: number } = { x: 0, y: 0 };
	intervalId: number | null = null;
	precisionError: number | null = null;
	windowCalibrator: GazeWindowCalibrator | null = null;
	private gazePointFactory: ((x: number, y: number) => GazeDataPoint) | null = null;

	constructor(config: GazeInputConfigDummy) {
		super(config);
		this.precisionError = config.precisionMinimalError;
		this.boundUpdateMousePosition = this.updateMousePosition.bind(this);
	}

	connect(): Promise<void> {

		if (!this.windowCalibrator) return Promise.reject('Window calibrator is not set.');

		this.handleConnected({ sessionId: this.createSessionId() });

		document.addEventListener('mousemove', this.boundUpdateMousePosition);

		return Promise.resolve();
	}

	start(): Promise<void> {
		if (this.isEmitting) {
			return Promise.reject('Already emitting.');
		}
		if (!this.sessionId) {
			return Promise.reject('Session ID is not set. Connect first.');
		}
		if (!this.windowCalibrator) {
			return Promise.reject('Window calibrator is not set.');
		}

		if (!this.gazePointFactory) {
			this.gazePointFactory = createGazePointFactory(
				this.sessionId,
				this.windowCalibrator,
				createGazeFixationDetector(this.config.fixationDetection)
			);
		}

		const interval = 1000 / this.config.frequency;
		this.intervalId = window.setInterval(() => {
			if (this.config && this.isConnected) {
				const { x, y } = this.calculateCoordinates();
				this.emit('data', this.gazePointFactory!(x, y));
			}
		}, interval);
		this.handleStarted();
		return Promise.resolve();
	}

	stop(): Promise<void> {
		if (!this.isEmitting) return Promise.reject('Already not emitting.');
		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}
		this.handleStopped();
		return Promise.resolve();
	}

	disconnect(): Promise<void> {
		if (!this.isConnected) return Promise.resolve();
		if (this.isEmitting) this.stop();
		document.removeEventListener('mousemove', this.boundUpdateMousePosition);
		this.gazePointFactory = null;
		this.handleDisconnected();
		return Promise.resolve();
	}

	calibrate(): Promise<void> {
		const precisionError = this.config?.precisionMinimalError;
		if (precisionError) {
			this.precisionError = precisionError;
		}
		return Promise.resolve();
	}

	send(msg: string): void {
		console.log(msg);
	}

	updateMousePosition(event: MouseEvent): void {
		this.lastMouseCoordinates = { x: event.clientX, y: event.clientY };
	}

	setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, windowConfig: GazeWindowCalibratorConfigWindowFields): Promise<void> {
		const calibrationObject = createGazeWindowCalibrator(mouseEvent, windowConfig);
		this.windowCalibrator = new GazeWindowCalibrator(calibrationObject);
		this.handleWindowCalibrated(calibrationObject);
		return Promise.resolve();
	}

	/**
	 * Calculate the coordinates of the fake gaze point.
	 * Based on mouse position and precision error.
	 */
	calculateCoordinates(): { x: number; y: number } {
		const x = this.simulateCoordinate(this.lastMouseCoordinates.x);
		const y = this.simulateCoordinate(this.lastMouseCoordinates.y);
		this.precisionError = Math.min(
			this.precisionError! + this.config!.precisionDecayRate,
			this.config!.precisionMaximumError
		);
		return { x, y };
	}

	/**
	 * Simulate the precision error of the dummy input.
	 * @param coordinate - The coordinate to simulate.
	 * @returns The simulated coordinate.
	 */
	simulateCoordinate(coordinate: number): number {
		return coordinate + (Math.random() - 0.5) * 2 * (this.precisionError || 0);
	}
}

export const createGazePointFactory = (
	sessionId: string,
	windowCalibrator: GazeWindowCalibrator,
	fixationDetector: GazeFixationDetector
): (x: number, y: number) => GazeDataPoint => {
	return (x: number, y: number) => {
		const xScreenRelative = windowCalibrator.toScreenRelativeX(x);
		const yScreenRelative = windowCalibrator.toScreenRelativeY(y);
		const point: GazeDataPoint = {
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
			sessionId,
			timestamp: Date.now(),
			validityL: true,
			validityR: true,
			parseValidity: true, // todo: implement validity check on window coordinates decorrelation
			type: 'point'
		};
		return fixationDetector.processGazePoint(point);
	};
}