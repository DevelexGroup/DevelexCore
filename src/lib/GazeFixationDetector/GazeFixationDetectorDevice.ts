import type { GazeDataPoint } from "../ETGazeData/ETGazeData";
import { GazeFixationDetector } from "./GazeFixationDetector";

export class GazeFixationDetectorDevice extends GazeFixationDetector {
    /**
     * Assumption that the points from DeveLex Bridge has already fixation information.
     * Therefore, this method simply returns the gaze point without any modifications.
     * 
     * Warning! This is used for "none" fixation detection method as well. The none or device
     * fixation detection method is taking effect in Python DeveLex Bridge code, where
     * it is decided whether to send fixation information or not.
     * 
     * Warnig! Some devices implemented in the DeveLex Bridge may not have fixation information
     * and disallow the "device" fixation detection method and only "none" or other methods are allowed.
     */
    processGazePoint(gazePoint: GazeDataPoint): GazeDataPoint {
        return gazePoint;
    }
}