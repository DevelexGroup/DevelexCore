export interface GazeDataPoint {
    type: 'point';

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

    timestamp: number;
    sessionId: string;

    validityL: boolean;
    validityR: boolean;

    parseValidity: boolean;

    fixationDuration?: number;
    fixationId?: number;
}

export interface GazeDataPointWithFixation extends GazeDataPoint {
    fixationDuration: number;
    fixationId: number;
}

export const isGazeDataPointWithFixation = (point: GazeDataPoint): point is GazeDataPointWithFixation => {
    return (point as GazeDataPointWithFixation).fixationDuration !== undefined;
}