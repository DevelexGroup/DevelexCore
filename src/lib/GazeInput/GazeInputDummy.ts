import type { GazeDataPointWithoutFixation } from '$lib/GazeData/GazeData';
import { GazeInput } from '$lib/GazeInput/GazeInput';
import { ETWindowCalibrator } from '../GazeWindowCalibrator/ETWindowCalibrator';
import { createETWindowCalibrator, type ETWindowCalibratorConfig, type ETWindowCalibratorConfigMouseEventFields, type ETWindowCalibratorConfigWindowFields } from '../GazeWindowCalibrator/ETWindowCalibratorConfig';
import type { GazeInputConfigDummy } from './GazeInputConfig';

/**
 * Dummy input for testing purposes which does not require any hardware.
 * Mouse position is used as gaze input in the given frequency.
 * It has its precision and frequency configurable.
 * TODO: Input classes simpler, more consistent, and more robust to handle high-frequency data.
 */
export class GazeInputDummy extends GazeInput<GazeInputConfigDummy> {
	lastMouseCoordinates: { x: number; y: number } = { x: 0, y: 0 };
	intervalId: number | null = null;
	precisionError: number | null = null;
	windowCalibrator: ETWindowCalibrator | null = null;

	constructor(config: GazeInputConfigDummy) {
		super(config);
		this.precisionError = config.precisionMinimalError;
	}

	connect(): Promise<void> {

		if (!this.windowCalibrator) {
			return Promise.reject('Window calibrator is not set.');
		}

		this.sessionID = this.createSessionId();
		this.isConnected = true;

		document.addEventListener('mousemove', this.updateMousePosition.bind(this));

		return Promise.resolve();
	}

	start(): Promise<void> {
		if (this.isEmitting) {
			return Promise.reject('Already emitting.');
		}
		if (!this.sessionID) {
			return Promise.reject('Session ID is not set. Connect first.');
		}
		if (!this.windowCalibrator) {
			return Promise.reject('Window calibrator is not set.');
		}
		const gazePointGetter = createGazePointFactory(this.sessionID, this.windowCalibrator);
		const interval = 1000 / this.config.frequency;
		this.intervalId = setInterval(() => {
			if (this.config && this.isConnected) {
				const { x, y } = this.calculateCoordinates();
				this.emit('data', gazePointGetter(x, y));
			}
		}, interval);
		this.isEmitting = true;
		return Promise.resolve();
	}

	stop(): Promise<void> {
		if (!this.isEmitting) return Promise.reject('Already not emitting.');
		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}
		this.isEmitting = false;
		return Promise.resolve();
	}

	disconnect(): Promise<void> {
		if (!this.isConnected) return Promise.reject('Already disconnected.');
		if (this.isEmitting) this.stop();
		document.removeEventListener('mousemove', this.updateMousePosition.bind(this));
		this.sessionID = null;
		this.isConnected = false;
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

	setWindowCalibration(mouseEvent: ETWindowCalibratorConfigMouseEventFields, windowConfig: ETWindowCalibratorConfigWindowFields): Promise<void> {
		this.windowCalibrator = new ETWindowCalibrator(createETWindowCalibrator(mouseEvent, windowConfig));
		this.isWindowCalibrated = true;
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
	windowCalibrator: ETWindowCalibrator
): (x: number, y: number) => GazeDataPointWithoutFixation => {
	return (x: number, y: number) => {
		const xScreenRelative = windowCalibrator.toScreenRelativeX(x);
		const yScreenRelative = windowCalibrator.toScreenRelativeY(y);
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
			sessionId,
			timestamp: Date.now(),
			validityL: true,
			validityR: true,
			parseValidity: true, // todo: implement validity check on window coordinates decorrelation
			parseTimestamp: Date.now(),
			type: 'point'
		};
	};
}