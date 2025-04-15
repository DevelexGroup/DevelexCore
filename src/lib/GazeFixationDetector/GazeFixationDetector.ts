import { Emitter } from "$lib/Emitter/Emitter";
import type { FixationDataPoint, GazeDataPoint } from "../GazeData/GazeData";

type GazeFixationDetectorEvents = {
    fixationStart: FixationDataPoint;
    fixationEnd: FixationDataPoint;
}

/**
 * Abstract class that defines the structure of the GazeFixationDetector class.
 * Very simple. Just a method that takes a GazeDataPoint. If fixation start or end is detected, it will emit a FixationDataPoint.
 */
export abstract class GazeFixationDetector extends Emitter<GazeFixationDetectorEvents> {
    abstract processGazePoint(gazePoint: GazeDataPoint): void;
    abstract processFixationPoint(fixationPoint: Omit<FixationDataPoint, 'fixationId'>): void; // used only by the Device detector
    abstract reset(): void;
}