import { describe, it, expect, afterEach, vi } from 'vitest';
import { GazeWindowCalibrator } from './GazeWindowCalibrator';
import { createGazeWindowCalibrator } from './GazeWindowCalibratorConfig';

const screenSize = { width: 2560, height: 1440 };

describe('GazeWindowCalibrator', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('maps gaze into a window on the primary monitor', () => {
		const config = createGazeWindowCalibrator(
			{ clientX: 1280, clientY: 600, screenX: 1280, screenY: 700 },
			{ screen: { ...screenSize, availLeft: 0, availTop: 0 } }
		);
		const calibrator = new GazeWindowCalibrator(config);

		expect(calibrator.toWindowX(0.5)).toBe(1280);
		expect(calibrator.toWindowY(0.5)).toBe(620);
	});

	it('maps gaze into a window on a monitor left of the primary one', () => {
		const config = createGazeWindowCalibrator(
			{ clientX: 1280, clientY: 600, screenX: -1280, screenY: 700 },
			{ screen: { ...screenSize, availLeft: -2560, availTop: 0 } }
		);
		const calibrator = new GazeWindowCalibrator(config);

		expect(calibrator.toWindowX(0)).toBe(0);
		expect(calibrator.toWindowX(0.5)).toBe(1280);
		expect(calibrator.toWindowX(1)).toBe(2560);
		expect(calibrator.toWindowY(0.5)).toBe(620);
	});

	it('maps gaze into a window on a monitor above the primary one', () => {
		const config = createGazeWindowCalibrator(
			{ clientX: 1280, clientY: 600, screenX: 1280, screenY: -740 },
			{ screen: { ...screenSize, availLeft: 0, availTop: -1440 } }
		);
		const calibrator = new GazeWindowCalibrator(config);

		expect(calibrator.toWindowX(0.5)).toBe(1280);
		expect(calibrator.toWindowY(0.5)).toBe(620);
	});

	it('round-trips window and screen-relative coordinates', () => {
		const config = createGazeWindowCalibrator(
			{ clientX: 300, clientY: 200, screenX: -2100, screenY: 320 },
			{ screen: { ...screenSize, availLeft: -2560, availTop: 0 } }
		);
		const calibrator = new GazeWindowCalibrator(config);

		expect(calibrator.toScreenRelativeX(calibrator.toWindowX(0.25))).toBeCloseTo(0.25);
		expect(calibrator.toScreenRelativeY(calibrator.toWindowY(0.75))).toBeCloseTo(0.75);
	});

	it('reads the monitor origin from the browser when the caller omits it', () => {
		vi.stubGlobal('screen', { availLeft: -2560, availTop: 0 });

		const config = createGazeWindowCalibrator(
			{ clientX: 1280, clientY: 600, screenX: -1280, screenY: 700 },
			{ screen: screenSize }
		);

		expect(config.windowScreenLeft).toBe(-2560);
		expect(new GazeWindowCalibrator(config).toWindowX(0.5)).toBe(1280);
	});

	it('treats a config without a monitor origin as the primary monitor', () => {
		const calibrator = new GazeWindowCalibrator({
			timestamp: '2026-01-01T00:00:00.000Z',
			clientX: 100,
			clientY: 100,
			screenX: 150,
			screenY: 200,
			windowScreenWidth: 1920,
			windowScreenHeight: 1080
		});

		expect(calibrator.toWindowX(0.5)).toBe(910);
		expect(calibrator.toWindowY(0.5)).toBe(440);
	});
});
