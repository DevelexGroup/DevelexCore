import type { FixationDataPoint } from "$lib/GazeData/GazeData";
import { calculatePointDistance } from "$lib/utils/geometryUtils";
import { getDifferenceInMilliseconds, getUnixTimestampFromISO8601 } from "$lib/utils/timeUtils";
import { GazeInteraction } from "./GazeInteraction";
import type { GazeInteractionScreenSaccadeEvents } from "./GazeInteractionScreenSaccade.event";

export class GazeInteractionScreenSaccade extends GazeInteraction<GazeInteractionScreenSaccadeEvents, FixationDataPoint> {
    
    endOfFirstFixation: FixationDataPoint | null = null;
    lastSaccadeData: GazeInteractionScreenSaccadeEvents["saccade"] | null = null;

    evaluate(data: FixationDataPoint): void {
        // TODO: Implement saccade invalidation on invalid data.
        if (data.type === "fixationEnd") {
            this.endOfFirstFixation = data;
            return;
        }
        if (data.type === "fixationStart" && this.endOfFirstFixation !== null) {
            const lastSaccadeData = this.createSaccadeEvent(this.endOfFirstFixation, data)
            this.emit("saccade", lastSaccadeData);
            this.lastSaccadeData = lastSaccadeData;
            this.endOfFirstFixation = null;
            return;
        }
    }

    /**
     * Calculates the angle to the horizontal screen axis.
     * @param x1 x-coordinate of the first point.
     * @param y1 y-coordinate of the first point.
     * @param x2 x-coordinate of the second point. 
     * @param y2 y-coordinate of the second point. 
     * @returns the angle to the horizontal screen axis (in degrees between -180 and 180).
     */
    calculateAngleToScreen(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }
    
    /**
     * Calculate angle to previous angle.
     * @param previousAngle The previous angle.
     * @param currentAngle The current angle.
     * @returns the angle to the previous angle (in degrees between -180 and 180).
     */
    calculateAngleToPrevious(angleOne: number, angleTwo: number): number {
        return (angleTwo - angleOne + 180) % 360 - 180;
    }

    createSaccadeEvent(fixationOne: FixationDataPoint, fixationTwo: FixationDataPoint): GazeInteractionScreenSaccadeEvents["saccade"] {
        const angleToScreen = this.calculateAngleToScreen(fixationOne.x, fixationOne.y, fixationTwo.x, fixationTwo.y);
        const distance = calculatePointDistance(fixationOne, fixationTwo);
        const duration = getDifferenceInMilliseconds(fixationTwo.timestamp, fixationOne.timestamp);
        const timestamp = fixationOne.timestamp;
        const type = "saccade";

        if (this.lastSaccadeData === null) {
            return {
                type,
                sessionId: fixationTwo.sessionId,
                timestamp,
                duration,
                distance,
                angleToScreen,
                targetFixation: fixationTwo,
                originFixation: fixationOne
            };
        }

        const angleToPrevious = this.calculateAngleToPrevious(this.lastSaccadeData.angleToScreen, angleToScreen);
        
        /**
         * Calculate the time between:
         * 1. The end of the previous fixation (which is when the current saccade started)
         * 2. The timestamp of the last recorded saccade
         * This value represents how long after the last saccade this new saccade occurred (in milliseconds)
         */
        const startTimeMs = getUnixTimestampFromISO8601(fixationOne.timestamp) - fixationOne.duration;
        const lastTimeMs = getUnixTimestampFromISO8601(this.lastSaccadeData.timestamp);
        const angleToPreviousInvalidityTime = startTimeMs - lastTimeMs;

        return {
            type,
            sessionId: fixationTwo.sessionId,
            timestamp,
            duration,
            distance,
            angleToScreen,
            angleToPrevious,
            angleToPreviousInvalidityTime,
            targetFixation: fixationTwo,
            originFixation: fixationOne
        };
    }
}