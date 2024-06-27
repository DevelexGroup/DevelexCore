import type { GazeDataPoint } from "../ETGazeData/ETGazeData";

/**
 * Abstract class that defines the structure of the GazeFixationDetector class.
 * Very simple. Just a method that takes a GazeDataPoint and returns a GazeDataPoint.
 * This can, however, be complicated enough to warrant its own class (esp. with custom detection algorithms).
 */
export abstract class GazeFixationDetector {
    abstract processGazePoint(gazePoint: GazeDataPoint): GazeDataPoint;
}