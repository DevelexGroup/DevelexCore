export interface GazeDataPoint {
    type: 'gaze';

    x: number;
    xL: number;
    xLScreenRelative: number;
    xR: number;
    xRScreenRelative: number;

    y: number;
    yL: number;
    yLScreenRelative: number;
    yR: number;
    yRScreenRelative: number;

    timestamp: string; // ISO date-time
    sessionId: string;

    validityL: boolean;
    validityR: boolean;

    parseValidity: boolean;

    pupilDiameterL: number;
    pupilDiameterR: number;

    fixationDuration?: number;
    fixationId?: number;
}

export interface GazeDataPointWithFixation extends GazeDataPoint {
    fixationDuration: number;
    fixationId: number;
}

export const isGazeDataPointWithFixation = (point: GazeDataPoint): point is GazeDataPointWithFixation => {
    return (point as GazeDataPointWithFixation)?.fixationDuration !== undefined;
}