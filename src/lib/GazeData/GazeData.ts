export type GazeDataPoint = GazeDataPointWithoutFixation | GazeDataPointWithFixation;

export type GazeDataPointWithoutFixation = {
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
}

export type GazeDataPointWithFixation = GazeDataPointWithoutFixation & {
    fixationDuration: number;
    fixationId: number;
}

export const isGazeDataPointWithFixation = (point: GazeDataPoint): point is GazeDataPointWithFixation => {
    return (point as GazeDataPointWithFixation).fixationDuration !== undefined;
}