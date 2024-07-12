import { isGazeDataPointWithFixation, type GazeDataPoint, type GazeDataPointWithFixation } from "$lib/GazeData/GazeData";
import type { GazeInput } from "$lib/GazeInput/GazeInput";
import type { GazeInputConfigWithFixations } from "$lib/GazeInput/GazeInputConfig";
import { GazeInteractionScreen } from "./GazeInteractionScreen";
import { type GazeInteractionScreenFixationEvents } from "./GazeInteractionScreenFixationEvent";

export class GazeInteractionScreenFixation extends GazeInteractionScreen<GazeInteractionScreenFixationEvents, GazeDataPoint> {

    currentFixationLastPoint: GazeDataPointWithFixation | null = null;

    connect(input: GazeInput<GazeInputConfigWithFixations>): void {
        input.on("data", this.inputCallback);
    }

    disconnect(input: GazeInput<GazeInputConfigWithFixations>): void {
        input.off("data", this.inputCallback);
    }

    evaluateInputData(data: GazeDataPoint): void {
        const { fixationPhase, fixationPoint, lastFixationPoint } = this.decideFixationPhase(data, this.currentFixationLastPoint);
        switch (fixationPhase) {
            case "start":
                const eventStart = this.createFixationEvent("fixationStart", fixationPoint.timestamp, fixationPoint.fixationDuration, fixationPoint);
                this.emit("fixationStart", eventStart);
                this.emit("fixation", eventStart);
                break;
            case "start-end":
                const eventStartEndEnd = this.createFixationEvent("fixationEnd", lastFixationPoint.timestamp, lastFixationPoint.fixationDuration, lastFixationPoint);
                const eventStartEndStart = this.createFixationEvent("fixationStart", fixationPoint.timestamp, fixationPoint.fixationDuration, fixationPoint);
                this.emit("fixationEnd", eventStartEndEnd);
                this.emit("fixationStart", eventStartEndStart);
                this.emit("fixation", eventStartEndEnd);
                this.emit("fixation", eventStartEndStart);
                break;
            case "progress":
                const eventProgress = this.createFixationEvent("fixationProgress", fixationPoint.timestamp, fixationPoint.fixationDuration, fixationPoint);
                this.emit("fixationProgress", eventProgress);
                this.emit("fixation", eventProgress);
                break;
            case "end":
                const eventEnd = this.createFixationEvent("fixationEnd", lastFixationPoint.timestamp, lastFixationPoint.fixationDuration, lastFixationPoint);
                this.emit("fixationEnd", eventEnd);
                this.emit("fixation", eventEnd);
                break;
        }
        this.currentFixationLastPoint = fixationPoint;
    }

    /**
     * Determines the fixation phase based on incoming gaze data.
     * If the data corresponds to an ongoing fixation, returns 'progress'.
     * If a new fixation starts, returns 'start'.
     * If a fixation ends, returns 'end'.
     * @param data - The gaze data to evaluate.
     * @returns The determined fixation phase.
     */
    decideFixationPhase = (
        data: GazeDataPoint,
        lastFixationPoint: GazeDataPointWithFixation | null
    ) => {
        if (isGazeDataPointWithFixation(data)) {
            if (data.fixationId === lastFixationPoint?.fixationId) {
                return {
                    fixationPhase: 'progress' as const,
                    fixationPoint: data,
                    lastFixationPoint
                };
            } else {
                if (lastFixationPoint !== null) {
                    return {
                        fixationPhase: 'start-end' as const,
                        fixationPoint: data,
                        lastFixationPoint: lastFixationPoint
                    };
                } else {
                    return {
                        fixationPhase: 'start' as const,
                        fixationPoint: data,
                        lastFixationPoint
                    };
                }
            }
        } else {
            if (lastFixationPoint !== null) {
                return {
                    fixationPhase: 'end' as const,
                    fixationPoint: null,
                    lastFixationPoint
                };
            } else {
                return {
                    fixationPhase: 'none' as const,
                    fixationPoint: null,
                    lastFixationPoint
                };
            }
        }
    }

    /**
	 * Creates an event object for the fixation event.
	 * @param type - The type of the fixation event ('fixationProgress', 'fixationFinish', 'fixationCancel').
	 * @param timestamp - The timestamp of the fixation event.
	 * @param duration - The elapsed time of the fixation event.
	 * @param data - The gaze data associated with the fixation event.
	 * @returns The created fixation event object.
	 */
	createFixationEvent(
		type: GazeInteractionScreenFixationEvents['type'],
		timestamp: number,
		duration: number,
		data: GazeDataPointWithFixation
	) {
		return {
			type,
			timestamp,
			duration,
			gazeData: data
		};
	}
}