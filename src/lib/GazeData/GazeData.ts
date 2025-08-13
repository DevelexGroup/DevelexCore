import type { FixationDataPayload, GazeDataPayload } from "$lib/GazeInput/GazeInputBridge.types";

export interface GazeDataPoint extends GazeDataPayload {
    sessionId: string;
    parseValidity: boolean;
    x: number;
    y: number;
    xLScreenRelative: number;
    yLScreenRelative: number;
    xRScreenRelative: number;
    yRScreenRelative: number;
}

export interface FixationDataPoint extends FixationDataPayload {
    sessionId: string;
    parseValidity: boolean;
    xScreenRelative: number;
    yScreenRelative: number;
    fixationId: number;
}
