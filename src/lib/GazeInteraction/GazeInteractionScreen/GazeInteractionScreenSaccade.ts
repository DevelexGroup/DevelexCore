import type { GazeDataPointWithFixation } from "$lib/GazeData/GazeData";
import { GazeInteractionScreen } from "./GazeInteractionScreen";
import type { GazeInteractionScreenFixation } from "./GazeInteractionScreenFixation";
import type { GazeInteractionScreenFixationEndEvent, GazeInteractionScreenFixationStartEvent } from "./GazeInteractionScreenFixationEvent";
import type { GazeInteractionScreenSaccadeEvents } from "./GazeInteractionScreenSaccadeEvent";

export class GazeInteractionScreenSaccade extends GazeInteractionScreen<GazeInteractionScreenSaccadeEvents, (GazeInteractionScreenFixationStartEvent | GazeInteractionScreenFixationEndEvent)> {
    
    endOfFirstFixation: GazeDataPointWithFixation | null = null;
    lastSaccadeData: GazeInteractionScreenSaccadeEvents["saccade"] | null = null;

    connect(input: GazeInteractionScreenFixation): void {
        input.on("fixationStart", this.inputCallback);
        input.on("fixationEnd", this.inputCallback);
    }
 
    disconnect(input: GazeInteractionScreenFixation): void {
        input.off("fixationStart", this.inputCallback);
        input.off("fixationEnd", this.inputCallback);
    }

    evaluateInputData(data: (GazeInteractionScreenFixationStartEvent | GazeInteractionScreenFixationEndEvent)): void {
        // TODO: Implement saccade invalidation on invalid data.
        if (data.type === "fixationEnd") {
            this.endOfFirstFixation = data.gazeData;
            return;
        }
        if (data.type === "fixationStart" && this.endOfFirstFixation !== null) {
            const lastSaccadeData = this.createSaccadeEvent(this.endOfFirstFixation, data.gazeData)
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

    /**
     * Calculates the distance between two points.
     * @param x1 x-coordinate of the first point.
     * @param y1 y-coordinate of the first point.
     * @param x2 x-coordinate of the second point. 
     * @param y2 y-coordinate of the second point. 
     * @returns the distance between two points.
    */
    calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    createSaccadeEvent(fixationOne: GazeDataPointWithFixation, fixationTwo: GazeDataPointWithFixation): GazeInteractionScreenSaccadeEvents["saccade"] {
        const angleToScreen = this.calculateAngleToScreen(fixationOne.x, fixationOne.y, fixationTwo.x, fixationTwo.y);
        const distance = this.calculateDistance(fixationOne.x, fixationOne.y, fixationTwo.x, fixationTwo.y);
        const duration = fixationTwo.timestamp - fixationOne.timestamp;
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
                gazeData: fixationTwo,
                originGazeData: fixationOne
            };
        }

        const angleToPrevious = this.calculateAngleToPrevious(this.lastSaccadeData.angleToScreen, angleToScreen);
        const angleToPreviousInvalidityTime = (fixationOne.timestamp - fixationOne.fixationDuration) - this.lastSaccadeData.timestamp;

        return {
            type,
            sessionId: fixationTwo.sessionId,
            timestamp,
            duration,
            distance,
            angleToScreen,
            angleToPrevious,
            angleToPreviousInvalidityTime,
            gazeData: fixationTwo,
            originGazeData: fixationOne
        };
    }
}