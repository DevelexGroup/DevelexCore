import type { FixationDataPoint } from "../GazeData/GazeData";
import { GazeFixationDetector } from "./GazeFixationDetector";

export class GazeFixationDetectorDevice extends GazeFixationDetector {
    fixationId: number = 0;
    /**
     * Assumption that the points from DeveLex Bridge has already fixation information.
     * Therefore, this method simply returns the gaze point without any modifications.
     * 
     * Warning! This is used for "none" fixation detection method as well. The none or device
     * fixation detection method is taking effect in Python DeveLex Bridge code, where
     * it is decided whether to send fixation information or not.
     * 
     * Warning! Some devices implemented in the DeveLex Bridge may not have fixation information
     * and disallow the "device" fixation detection method and only "none" or other methods are allowed.
     */
    processGazePoint(): void {
        // nothing to do
    }

    processFixationPoint(fixationPoint: Omit<FixationDataPoint, 'fixationId'>): void {
        if (fixationPoint.type === "fixationStart") {
            this.emit("fixationStart", { ...fixationPoint, fixationId: this.fixationId });
        } else if (fixationPoint.type === "fixationEnd") {
            this.emit("fixationEnd", { ...fixationPoint, fixationId: this.fixationId });
            this.fixationId++;
        }
    }

    reset(): void {
        // nothing to reset
    }
}