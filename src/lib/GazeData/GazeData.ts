export type GazeDataPoint = GazeDataPointWithoutFixation | GazeDataPointWithFixation;

export type GazeDataPointWithoutFixation = {
    type: 'point';

    x: number;
    xScreenRelative: number;

    y: number;
    yScreenRelative: number;

    timestamp: number;
    sessionId: string;

    deviceValidity: boolean;
    parseValidity: boolean;
}

export type GazeDataPointWithFixation = GazeDataPointWithoutFixation & {
    fixationDuration: number;
    fixationId: number;
}

export const isGazeDataPointWithFixation = (point: GazeDataPoint): point is GazeDataPointWithFixation => {
    return (point as GazeDataPointWithFixation).fixationDuration !== undefined;
}