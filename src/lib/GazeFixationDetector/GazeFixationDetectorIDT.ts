import { GazeFixationDetector } from "./GazeFixationDetector"
import { type GazeDataPoint, type FixationDataPoint } from "$lib/GazeData/GazeData";
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

    // Track last valid fixation snapshot (for precise fixationEnd)
    private lastValidSnapshotTimestamp: string | null = null;
    private lastValidSnapshotDuration: number = 0;
    private lastValidSnapshotAverages: { x: number; y: number; xScreenRelative: number; yScreenRelative: number } | null = null;
    private lastValidSnapshotSample: GazeDataPoint | null = null;

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
        // Handle null/undefined samples gracefully: treat as stream break
        // and close an ongoing fixation, if any, using the last valid snapshot.
        if (gazePoint == null) {
            if (this.wasPreviousPointValidFixation && this.lastValidSnapshotSample && this.lastValidSnapshotAverages && this.lastValidSnapshotTimestamp) {
                const s = this.lastValidSnapshotSample;
                const fixationPoint: FixationDataPoint = {
                    type: 'fixationEnd',
                    deviceId: s.deviceId,
                    timestamp: this.lastValidSnapshotTimestamp,
                    deviceTimestamp: s.deviceTimestamp,
                    duration: this.lastValidSnapshotDuration,
                    x: this.lastValidSnapshotAverages.x,
                    y: this.lastValidSnapshotAverages.y,
                    xScreenRelative: this.lastValidSnapshotAverages.xScreenRelative,
                    yScreenRelative: this.lastValidSnapshotAverages.yScreenRelative,
                    sessionId: s.sessionId,
                    parseValidity: s.parseValidity,
                    fixationId: this.currentFixationId
                };
                this.emit('fixationEnd', fixationPoint);
            }
            this.reset();
            return;
        }

        // Check validity of the gaze point, if both eyes are invalid, do nothing
        // TODO: OPTIMISE IDT PROCESS 
        if (!gazePoint.validityL && !gazePoint.validityR) return;

        // Guard against non-finite coordinates which could break dispersion calc
        if (!Number.isFinite(gazePoint.x) || !Number.isFinite(gazePoint.y)) return;

        // Push new point to window
        this.windowGazePoints.push(gazePoint);
        this.sumXL += gazePoint.xL;
        this.sumXR += gazePoint.xR;
        this.sumYL += gazePoint.yL;
        this.sumYR += gazePoint.yR;
        this.sumXLScreenRelative += gazePoint.xLScreenRelative;
        this.sumXRScreenRelative += gazePoint.xRScreenRelative;
        this.sumYLScreenRelative += gazePoint.yLScreenRelative;
        this.sumYRScreenRelative += gazePoint.yRScreenRelative;

        // Trim from the front until dispersion (bbox) is within tolerance
        while (this.windowGazePoints.length > 0 && getBoundingBoxDispersion(this.windowGazePoints) > this.pixelTolerance) {
            const removed = this.windowGazePoints.shift()!;
            this.sumXL -= removed.xL;
            this.sumXR -= removed.xR;
            this.sumYL -= removed.yL;
            this.sumYR -= removed.yR;
            this.sumXLScreenRelative -= removed.xLScreenRelative;
            this.sumXRScreenRelative -= removed.xRScreenRelative;
            this.sumYLScreenRelative -= removed.yLScreenRelative;
            this.sumYRScreenRelative -= removed.yRScreenRelative;
        }

        const duration = this.getWindowDuration();
        const meetsDuration = duration >= this.minimumFixationDuration;

        if (meetsDuration && this.windowGazePoints.length > 0) {
            if (!this.wasPreviousPointValidFixation) {
                this.fixationId++;
                this.currentFixationId = this.fixationId;
                // Get average coordinates for fixation start
                const averageCoords = this.getAverageCoordinates();
                
                // Emit fixation start event
                const fixationPoint: FixationDataPoint = {
                    type: 'fixationStart',
                    deviceId: gazePoint.deviceId,
                    timestamp: this.windowGazePoints[this.windowGazePoints.length - 1].timestamp,
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

            // Update last valid snapshot
            const averages = this.getAverageCoordinates();
            const last = this.windowGazePoints[this.windowGazePoints.length - 1];
            this.lastValidSnapshotAverages = averages;
            this.lastValidSnapshotTimestamp = last.timestamp;
            this.lastValidSnapshotDuration = duration;
            this.lastValidSnapshotSample = last;
        } else {
            if (this.wasPreviousPointValidFixation) {
                // Emit fixation end using the LAST VALID snapshot
                if (this.lastValidSnapshotSample && this.lastValidSnapshotAverages && this.lastValidSnapshotTimestamp) {
                    const s = this.lastValidSnapshotSample;
                    const fixationPoint: FixationDataPoint = {
                        type: 'fixationEnd',
                        deviceId: s.deviceId,
                        timestamp: this.lastValidSnapshotTimestamp,
                        deviceTimestamp: s.deviceTimestamp,
                        duration: this.lastValidSnapshotDuration,
                        x: this.lastValidSnapshotAverages.x,
                        y: this.lastValidSnapshotAverages.y,
                        xScreenRelative: this.lastValidSnapshotAverages.xScreenRelative,
                        yScreenRelative: this.lastValidSnapshotAverages.yScreenRelative,
                        sessionId: s.sessionId,
                        parseValidity: s.parseValidity,
                        fixationId: this.currentFixationId
                    };
                    this.emit('fixationEnd', fixationPoint);
                }
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

    getWindowDuration(): number {
        if (this.windowGazePoints.length === 0) return 0;
        const first = this.windowGazePoints[0];
        const last = this.windowGazePoints[this.windowGazePoints.length - 1];
        return getDifferenceInMilliseconds(last.timestamp, first.timestamp);
    }

    reset(): void {
        this.windowGazePoints = [];
        this.durationOfFullfilledDispersionGazeDataPoints = 0;
        this.wasPreviousPointValidFixation = false;
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
        // Reset last valid snapshot
        this.lastValidSnapshotAverages = null;
        this.lastValidSnapshotTimestamp = null;
        this.lastValidSnapshotDuration = 0;
        this.lastValidSnapshotSample = null;
    }

}

export const getBoundingBoxDispersion = (gazePoints: GazeDataPoint[]): number => {
    if (gazePoints.length === 0) return 0;
    let minX = gazePoints[0].x;
    let maxX = gazePoints[0].x;
    let minY = gazePoints[0].y;
    let maxY = gazePoints[0].y;
    for (let i = 1; i < gazePoints.length; i++) {
        const gp = gazePoints[i];
        if (gp.x < minX) minX = gp.x;
        if (gp.x > maxX) maxX = gp.x;
        if (gp.y < minY) minY = gp.y;
        if (gp.y > maxY) maxY = gp.y;
    }
    return (maxX - minX) + (maxY - minY);
}


export const getSizeInCentimetersFromDegrees = (degrees: number, distanceFromScreen: number): number => {
    const radians = (degrees * Math.PI) / 180;
    return 2 * distanceFromScreen * Math.tan(radians / 2);
}

export const getSizeInPixelsFromCentimeters = (centimeters: number, DPI: number): number => {
    const ONE_INCH_IN_CM = 2.54;
    return centimeters * DPI / ONE_INCH_IN_CM;
}