import { EmitterWithFacade } from "$lib/Emitter/Emitter";
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";
import { createGazeInput } from ".";
import type { GazeInput } from "./GazeInput";
import type { GazeInputConfig } from "./GazeInputConfig";
import type { ETHandlerMapping } from "./GazeInputEvent";

export class GazeInputFacade extends EmitterWithFacade<ETHandlerMapping> {

    constructor() {
        super();
    }

    /**
     * Get the current input instance.
     * @returns The current input instance or null if not set.
     */
    get input(): GazeInput<GazeInputConfig> | null {
        const input = this.internalEmitter
        if (!input) return null
        return input as GazeInput<GazeInputConfig>
    }

    /**
     * Get the current input instance.
     * @returns The current input instance.
     * @throws Error if no input is set.
     */
    get inputInstance(): GazeInput<GazeInputConfig> {
        if (!this.input) {
            throw new Error("No input instance set.");
        }
        return this.input as GazeInput<GazeInputConfig>
    }

    /**
     * Set the input instance.
     * @param input - The input instance to set.
     */
    set input(input: GazeInput<GazeInputConfig>) {
        this.setEmitter(input);
    }

    /**
     * Start the input.
     * @throws Error if no input is set.
     */
    start(): void {
        this.inputInstance.start();
    }

    /**
     * Stop the input.
     * @throws Error if no input is set.
     */
    stop(): void {
        this.inputInstance.stop();
    }

    /**
     * Connect the input.
     * @throws Error if no input is set.
     */
    connect(): void {
        this.inputInstance.connect();
    }

    /**
     * Disconnect the input.
     * @throws Error if no input is set.
     */
    disconnect(): void {
        this.inputInstance.disconnect();
    }

    /**
     * Calibrate the input.
     * @throws Error if no input is set.
     */
    calibrate(): void {
        this.inputInstance.calibrate();
    }

    /**
     * Set the window calibration.
     * @param mouseEvent - The mouse event.
     * @param window - The window.
     * @throws Error if no input is set.
     */
    setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): void {
        void mouseEvent;
        void window;
    }

    /**
     * Check if the input is connected.
     * @returns True if connected, false otherwise.
     * @throws Error if no input is set.
     */
    isConnected(): boolean {
        return false;
    }

    /**
     * Create an input instance.
     * @param config - The input configuration.
     */
    createInput(config: GazeInputConfig): void {
        this.input = createGazeInput(config);
    }
}