import { EmitterWithFacade } from "$lib/Emitter/Emitter";
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { createGazeInput } from ".";
import type { GazeInput } from "./GazeInput";
import type { GazeInputConfig } from "./GazeInputConfig";
import type { GazeInputEvents } from "./GazeInputEvent";
import type { GazeWindowCalibratorConfig } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js";
import type { ReceiveResponsePayload } from "./GazeInputBridge.types";

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
     * Get the window calibration values.
     * @returns The window calibration values or null if no window calibration is set.
     * @readonly
     */
    get windowCalibration(): GazeWindowCalibratorConfig | null { 
        return this.input ? this.input.windowCalibration : null 
    }

    /**
     * Get the last status.
     * @returns The last status or null if no status is set.
     * @readonly
     */
    get lastStatus(): ReceiveResponsePayload | null {
        return this.input ? this.input.lastStatus : null
    }

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
     * Subscribe to the input.
     * @throws Error if no input is set.
     */
    async subscribe() {
        return this.inputInstance.subscribe();
    }

    /**
     * Unsubscribe from the input.
     * @throws Error if no input is set.
     */
    async unsubscribe() {
        return this.inputInstance.unsubscribe();
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
     * Open the input.
     * @throws Error if no input is set.
     */
    async open() {
        return this.inputInstance.open();
    }

    /**
     * Close the input.
     * @throws Error if no input is set.
     */
    async close() {
        return this.inputInstance.close();
    }

    /**
     * Get the status of the input.
     * @throws Error if no input is set.
     */
    async status() {
        return this.inputInstance.status();
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