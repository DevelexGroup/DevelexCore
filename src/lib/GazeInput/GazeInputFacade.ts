import { EmitterWithFacade } from "$lib/Emitter/Emitter";
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";
import type { GazeInputConfig } from "./GazeInputConfig";
import type { ETHandlerMapping } from "./GazeInputEvent";

export class GazeInputFacade extends EmitterWithFacade<ETHandlerMapping> {
    constructor() {
        super();
    }

    start(): void {
    }

    stop(): void {
    }

    connect(): void {
    }

    disconnect(): void {
    }

    calibrate(): void {
    }

    setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): void {
        void mouseEvent;
        void window;
    }

    isConnected(): boolean {
        return false;
    }

    createInput(input: GazeInputConfig): void {
        void input;
    }
}