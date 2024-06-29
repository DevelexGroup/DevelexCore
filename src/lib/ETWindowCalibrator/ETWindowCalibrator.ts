import type { ETWindowCalibratorConfig } from "./ETWindowCalibratorConfig";

/**
 * Class that calibrates the window coordinates to screen coordinates and vice versa.
 * This is tricky as it requires a PointerEvent to get the difference between
 * screen and window coordinates.
 * WARNING: On window resize, create a new instance of this class.
 * 
 * It is generally used in ETInput classes to convert screen relative coordinates to window px coordinates and vice versa.
 * If ETInput uses worker threads, it should be placed there and send configurations from the main thread.
 * 
 * @category Core
 */
export class ETWindowCalibrator {
    xCoeff: number;
	yCoeff: number;
	windowScreenWidth: number;
	windowScreenHeight: number;
	isListenerAttached: boolean = false;

	constructor(config: ETWindowCalibratorConfig) {
		const { xCoeff, yCoeff } = this.processPointerEvent(config);
		this.xCoeff = xCoeff;
		this.yCoeff = yCoeff;
		this.windowScreenWidth = config.windowScreenWidth;
		this.windowScreenHeight = config.windowScreenHeight;
	}

	/**
	 * Pointer move event is used to calculate the difference between screen and window coordinates.
	 * @param event - The pointer move event.
	 */
	processPointerEvent(config: ETWindowCalibratorConfig): { xCoeff: number; yCoeff: number } {
		const x = config.clientX;
		const y = config.clientY;
		const screenX = config.screenX;
		const screenY = config.screenY;
		return {
			xCoeff: x - screenX,
			yCoeff: y - screenY
		};
	}

	/**
	 * Converts a screen relative x coordinate to a window px coordinate.
	 * @param x - The screen relative x coordinate, usually between 0 and 1.
	 * @returns number - window x px coordinate.
	 */
	toWindowX = (x: number): number => {
		return x * this.windowScreenWidth + this.xCoeff;
	};

	/**
	 * Converts a screen relative y coordinate to a window px coordinate.
	 * @param y - The screen relative y coordinate, usually between 0 and 1.
	 * @returns number - window y px coordinate.
	 */
	toWindowY = (y: number): number => {
		return y * this.windowScreenHeight + this.yCoeff;
	};

	/**
	 * Converts a window x px coordinate to a screen relative x coordinate.
	 * @param x - The window x px coordinate.
	 * @returns number - screen relative x coordinate, usually between 0 and 1.
	 */
	toScreenRelativeX = (x: number): number => {
		return (x - this.xCoeff) / this.windowScreenWidth;
	};

	/**
	 * Converts a window y px coordinate to a screen relative y coordinate.
	 * @param y - The window y px coordinate.
	 * @returns number - screen relative y coordinate, usually between 0 and 1.
	 */
	toScreenRelativeY = (y: number): number => {
		return (y - this.yCoeff) / this.windowScreenHeight;
	};

}