import { GazeFixationDetector } from "./GazeFixationDetector"
import { type GazeDataPointWithFixation, type GazeDataPoint, isGazeDataPointWithFixation } from "$lib/GazeData/GazeData";

/**
 * Default parameters are from Andersson et al. (2017):
 * "The original default values for this implementation were 100 ms minimum fixation duration and 1.35° maximum fixation dispersion."
 * The IDT algorithm works with x- and y data, and two fixed thresholds: the maximum fixation dispersion threshold and the minimum fixation duration threshold.
 * To be a fixation, data samples constituting at least enough time to fulfill the duration threshold has to be within a spatial area not exceeding the dispersion threshold. 
 */
export class GazeFixationDetectorIDT extends GazeFixationDetector {

    pixelTolerance: number;
    minimumFixationDuration: number;

    windowGazePoints: GazeDataPoint[] = [];
    durationOfFullfilledDispersionGazeDataPoints: number = 0;

    fixationId: number = 0;

    constructor(
        // IDT specific parameters
        minimumFixationDuration: number = 100,
        maximumFixationDispersion: number = 1.35,
        distanceFromScreen: number = 0.7,
        DPI: number = 96
    ) {
        super();
        const sizeInCentimeters = getSizeInCentimetersFromDegrees(maximumFixationDispersion, distanceFromScreen);
        this.pixelTolerance = getSizeInPixelsFromCentimeters(sizeInCentimeters, DPI);
        this.minimumFixationDuration = minimumFixationDuration;
    }
    
    /**
     * It takes a gaze point and processes it to determine if it is a fixation or not. If so, it returns a GazeDataPointWithFixation object.
     * @param gazePoint 
     * @returns data point with fixation information GazeDataPoint || GazeDataPointWithFixation
     */
    processGazePoint(gazePoint: GazeDataPoint): GazeDataPoint {
        const dispersion = getMaxDispersion([...this.windowGazePoints, gazePoint]);
        const duration = this.getDuration(gazePoint);
        const isValidDispersionWise = dispersion <= this.pixelTolerance;
        const isValidDurationWise = duration >= this.minimumFixationDuration;
        const wasPreviousPointValidFixation = isGazeDataPointWithFixation(this.windowGazePoints[this.windowGazePoints.length - 1]);

        let result = gazePoint;

        if (isValidDispersionWise) {
            this.durationOfFullfilledDispersionGazeDataPoints = duration;
            this.windowGazePoints.push(gazePoint);
        } else {
            this.reset();
        }

        if (isValidDurationWise && isValidDispersionWise) {
            if (!wasPreviousPointValidFixation) {
                this.fixationId++;
            }
            const gazePointWithFixation: GazeDataPointWithFixation = {
                ...gazePoint,
                fixationId: this.fixationId,
                fixationDuration: duration
            };
            this.windowGazePoints[this.windowGazePoints.length - 1] = gazePointWithFixation; // replace last point with fixation point
            result = gazePointWithFixation;
        }

        return result;
    }

    getDuration(gazePoint: GazeDataPoint): number {
        const { timestamp } = gazePoint;
        const timeFromLastFullfilledDispersionGazeDataPoint = this.windowGazePoints[this.windowGazePoints.length - 1] ? timestamp - this.windowGazePoints[this.windowGazePoints.length - 1].timestamp : 0;
        return this.durationOfFullfilledDispersionGazeDataPoints + timeFromLastFullfilledDispersionGazeDataPoint;
    }

    reset(): void {
        this.windowGazePoints = [];
        this.durationOfFullfilledDispersionGazeDataPoints = 0;
    }

}

export const getMaxDispersion = (gazePoints: GazeDataPoint[]): number => {
    let maxDispersion = 0;
    for (let i = 0; i < gazePoints.length; i++) {
        for (let j = i + 1; j < gazePoints.length; j++) {
            const dispersion = getDispersion(gazePoints[i], gazePoints[j]);
            if (dispersion > maxDispersion) {
                maxDispersion = dispersion;
            }
        }
    }
    return maxDispersion;
}

export const getDispersion = (gazePoint1: GazeDataPoint, gazePoint2: GazeDataPoint): number => {
    return Math.sqrt(Math.pow(gazePoint1.x - gazePoint2.x, 2) + Math.pow(gazePoint1.y - gazePoint2.y, 2));
}

export const getSizeInCentimetersFromDegrees = (degrees: number, distanceFromScreen: number): number => {
    return 2 * distanceFromScreen * Math.tan(degrees / 2);
}

export const getSizeInPixelsFromCentimeters = (centimeters: number, DPI: number): number => {
    const ONE_INCH_IN_CM = 2.54;
    return centimeters * DPI / ONE_INCH_IN_CM;
}