import { GazeFixationDetector } from "./GazeFixationDetector"
import { type GazeDataPoint, type FixationDataPoint } from "$lib/GazeData/GazeData";
import { calculatePointDistance } from "$lib/utils/geometryUtils";
import { getDifferenceInMilliseconds } from "$lib/utils/timeUtils";

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
    wasPreviousPointValidFixation: boolean = false;

    fixationId: number = 0;
    currentFixationId: number = 0;

    // Track sums for calculating averages
    sumXL: number = 0;
    sumXR: number = 0;
    sumYL: number = 0;
    sumYR: number = 0;
    sumXLScreenRelative: number = 0;
    sumXRScreenRelative: number = 0;
    sumYLScreenRelative: number = 0;
    sumYRScreenRelative: number = 0;

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
    
    processFixationPoint(): void {
        // do nothing as nothing from Bridge is relevant
    }

    /**
     * It takes a gaze point and processes it to determine if it is a fixation or not. If so, it emits a fixationStart or fixationEnd event.
     * @param gazePoint 
     */
    processGazePoint(gazePoint: GazeDataPoint): void {
        const dispersion = getMaxDispersion([...this.windowGazePoints, gazePoint]);
        const duration = this.getDuration(gazePoint);
        const isValidDispersionWise = dispersion <= this.pixelTolerance;
        const isValidDurationWise = duration >= this.minimumFixationDuration;

        if (isValidDispersionWise) {
            this.durationOfFullfilledDispersionGazeDataPoints = duration;
            this.windowGazePoints.push(gazePoint);
            
            // Add to running sums
            this.sumXL += gazePoint.xL;
            this.sumXR += gazePoint.xR;
            this.sumYL += gazePoint.yL;
            this.sumYR += gazePoint.yR;
            this.sumXLScreenRelative += gazePoint.xLScreenRelative;
            this.sumXRScreenRelative += gazePoint.xRScreenRelative;
            this.sumYLScreenRelative += gazePoint.yLScreenRelative;
            this.sumYRScreenRelative += gazePoint.yRScreenRelative;
        }

        if (isValidDurationWise && isValidDispersionWise) {
            if (!this.wasPreviousPointValidFixation) {
                this.fixationId++;
                this.currentFixationId = this.fixationId;
                // Get average coordinates for fixation start
                const averageCoords = this.getAverageCoordinates();
                
                // Emit fixation start event
                const fixationPoint: FixationDataPoint = {
                    type: 'fixationStart',
                    deviceId: gazePoint.deviceId,
                    timestamp: gazePoint.timestamp,
                    deviceTimestamp: gazePoint.deviceTimestamp,
                    duration: duration,
                    x: averageCoords.x,
                    y: averageCoords.y,
                    xScreenRelative: averageCoords.xScreenRelative,
                    yScreenRelative: averageCoords.yScreenRelative,
                    sessionId: gazePoint.sessionId,
                    parseValidity: gazePoint.parseValidity,
                    fixationId: this.currentFixationId
                };
                this.emit('fixationStart', fixationPoint);
            }
            this.wasPreviousPointValidFixation = true;
        } else {
            if (this.wasPreviousPointValidFixation) {
                // Get average coordinates for fixation end BEFORE resetting window data
                const averageCoords = this.getAverageCoordinates();
                
                // Emit fixation end event
                const fixationPoint: FixationDataPoint = {
                    type: 'fixationEnd',
                    deviceId: gazePoint.deviceId, 
                    timestamp: gazePoint.timestamp,
                    deviceTimestamp: gazePoint.deviceTimestamp,
                    duration: duration,
                    x: averageCoords.x,
                    y: averageCoords.y,
                    xScreenRelative: averageCoords.xScreenRelative,
                    yScreenRelative: averageCoords.yScreenRelative,
                    sessionId: gazePoint.sessionId,
                    parseValidity: gazePoint.parseValidity,
                    fixationId: this.currentFixationId
                };
                this.emit('fixationEnd', fixationPoint);
            }
            // Only reset after we've generated fixation end event
            if (!isValidDispersionWise) {
                this.reset();
            }
            this.wasPreviousPointValidFixation = false;
        }
    }

    /**
     * Calculate the average coordinates from all points in the current fixation window
     */
    getAverageCoordinates() {
        const count = this.windowGazePoints.length;
        if (count === 0) return { x: 0, y: 0, xScreenRelative: 0, yScreenRelative: 0 };
        
        return {
            x: (this.sumXL + this.sumXR) / (2 * count),
            y: (this.sumYL + this.sumYR) / (2 * count),
            xScreenRelative: (this.sumXLScreenRelative + this.sumXRScreenRelative) / (2 * count),
            yScreenRelative: (this.sumYLScreenRelative + this.sumYRScreenRelative) / (2 * count)
        };
    }

    getDuration(gazePoint: GazeDataPoint): number {
        const { timestamp } = gazePoint;
        const timeFromLastFullfilledDispersionGazeDataPoint = this.windowGazePoints[this.windowGazePoints.length - 1] ? getDifferenceInMilliseconds(timestamp, this.windowGazePoints[this.windowGazePoints.length - 1].timestamp) : 0;
        return this.durationOfFullfilledDispersionGazeDataPoints + timeFromLastFullfilledDispersionGazeDataPoint;
    }

    reset(): void {
        this.windowGazePoints = [];
        this.durationOfFullfilledDispersionGazeDataPoints = 0;
        // Reset coordinate sums
        this.sumXL = 0;
        this.sumXR = 0;
        this.sumYL = 0;
        this.sumYR = 0;
        this.sumXLScreenRelative = 0;
        this.sumXRScreenRelative = 0;
        this.sumYLScreenRelative = 0;
        this.sumYRScreenRelative = 0;
        // Don't reset the currentFixationId here - we want to keep it until the next fixation starts
    }

}

export const getMaxDispersion = (gazePoints: GazeDataPoint[]): number => {
    let maxDispersion = 0;
    for (let i = 0; i < gazePoints.length; i++) {
        for (let j = i + 1; j < gazePoints.length; j++) {
            const dispersion = calculatePointDistance(gazePoints[i], gazePoints[j]);
            if (dispersion > maxDispersion) {
                maxDispersion = dispersion;
            }
        }
    }
    return maxDispersion;
}


export const getSizeInCentimetersFromDegrees = (degrees: number, distanceFromScreen: number): number => {
    return 2 * distanceFromScreen * Math.tan(degrees / 2);
}

export const getSizeInPixelsFromCentimeters = (centimeters: number, DPI: number): number => {
    const ONE_INCH_IN_CM = 2.54;
    return centimeters * DPI / ONE_INCH_IN_CM;
}