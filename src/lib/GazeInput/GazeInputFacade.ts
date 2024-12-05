import { EmitterWithFacade } from "$lib/Emitter/Emitter";
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { createGazeInput } from ".";
import type { GazeInput } from "./GazeInput";
import type { GazeInputConfig } from "./GazeInputConfig";
import type { GazeInputEvents } from "./GazeInputEvent";
import type { GazeWindowCalibratorConfig } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js";

export class GazeInputFacade extends EmitterWithFacade<GazeInputEvents> {

    /**
     * Get the current input.
     * @returns The current input or null if no input is set.
     * @readonly
     */
    get input(): GazeInput<GazeInputConfig> | null {
        const input = this.internalEmitter
        if (!input) return null
        return input as GazeInput<GazeInputConfig>
    }

    /**
     * Get the current input instance.
     * @returns The current input instance or null if no input is set.
     * @readonly
     * @throws Error if no input is set.
     */ 
    get inputInstance(): GazeInput<GazeInputConfig> {
        if (!this.input) {
            throw new Error("No input instance set.");
        }
        return this.input as GazeInput<GazeInputConfig>
    }

    /**
	 * Get the current connected state.
	 * @returns True if connected, false otherwise.
	 * @readonly
	 * @emits connect - When the connected state changes.
	 * @emits state - When the connected state changes.
	 */
    get isConnected(): boolean { return this.input ? this.input.isConnected : false }
	
    /**
	 * Get the current emitting state.
	 * @returns True if emitting, false otherwise.
	 * @readonly
	 * @emits emit - When the emitting state changes.
	 * @emits state - When the emitting state changes.
	 */
    get isEmitting(): boolean { return this.input ? this.input.isEmitting : false }
	
    /**
	 * Get the current window calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits windowCalibrated - When the window calibration state changes.
	 * @emits state - When the window calibration state changes.
	 */
    get isWindowCalibrated(): boolean { return this.input ? this.input.isWindowCalibrated : false }

    /**
     * Get the window calibration values.
     * @returns The window calibration values or null if no window calibration is set.
     * @readonly
     */
    get windowCalibration(): GazeWindowCalibratorConfig | null { 
        return this.input ? this.input.windowCalibration : null 
    }

    /**
	 * Get the current device calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits calibrated - When the device calibration state changes.
	 * @emits state - When the device calibration state changes.
	 */ 
    get isDeviceCalibrated(): boolean { return this.input ? this.input.isDeviceCalibrated : false }

    /**
     * Set the input instance.
     * @param input - The input instance to set.
     */
    set input(input: GazeInput<GazeInputConfig> | null) {
        this.setEmitter(input);
    }

    /**
     * Start the input.
     * @throws Error if no input is set.
     */
    async start() {
        return this.inputInstance.start();
    }

    /**
     * Stop the input.
     * @throws Error if no input is set.
     */
    async stop() {
        return this.inputInstance.stop();
    }

    /**
     * Connect the input.
     * @throws Error if no input is set.
     */
    async connect() {
        return this.inputInstance.connect();
    }

    /**
     * Disconnect the input.
     * @throws Error if no input is set.
     */
    async disconnect() {
        if (!this.input) return
        return this.inputInstance.disconnect();
    }

    /**
     * Calibrate the input.
     * @throws Error if no input is set.
     */
    async calibrate() {
        return this.inputInstance.calibrate();
    }

    /**
     * Set the window calibration.
     * @param mouseEvent - The mouse event.
     * @param window - The window.
     * @throws Error if no input is set.
     */
    async setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields) {
        return this.inputInstance.setWindowCalibration(mouseEvent, window);
    }

    /**
     * Create an input instance.
     * @param config - The input configuration.
     */
    createInput(config: GazeInputConfig): void {
        this.input = createGazeInput(config);
    }
}