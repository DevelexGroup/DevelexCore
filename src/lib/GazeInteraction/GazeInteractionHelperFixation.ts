import type { GazeDataPoint, GazeDataPointWithFixation } from '$lib';
import { isGazeDataPointWithFixation } from '$lib';

/**
 * Determines the fixation phase based on incoming gaze data.
 * If the data corresponds to an ongoing fixation, returns 'progress'.
 * If a new fixation starts, returns 'start'.
 * If a fixation ends, returns 'end'.
 * @param data - The gaze data to evaluate.
 * @returns The determined fixation phase.
 */
export const decideFixationPhase = (
    data: GazeDataPoint,
    evaluatedFixationPoint: GazeDataPointWithFixation | null
) => {
    if (isGazeDataPointWithFixation(data)) {
        if (data.fixationId === evaluatedFixationPoint?.fixationId) {
            return {
                fixationPhase: 'progress' as const,
                fixationPoint: data
            };
        } else {
            if (evaluatedFixationPoint !== null) {
                return {
                    fixationPhase: 'start-end' as const,
                    fixationPoint: data
                };
            } else {
                return {
                    fixationPhase: 'start' as const,
                    fixationPoint: data
                };
            }
        }
    } else {
        if (evaluatedFixationPoint !== null) {
            return {
                fixationPhase: 'end' as const,
                fixationPoint: null
            };
        } else {
            return {
                fixationPhase: 'none' as const,
                fixationPoint: null
            };
        }
    }
};
