import type { GazeDataPayload } from "../GazeInput/GazeInputBridge.types";

export const getGazeDataPointCenter = (point: GazeDataPayload): { x: number; y: number; } => {
    if (point.validityL && point.validityR) {
        return {
            x: (point.xL + point.xR) / 2,
            y: (point.yL + point.yR) / 2
        };
    } else if (point.validityL) {
        return {
            x: point.xL,
            y: point.yL
        };
    } else if (point.validityR) {
        return {
            x: point.xR,
            y: point.yR
        };
    } else {
        return {
            x: 0,
            y: 0
        };
    }
};
