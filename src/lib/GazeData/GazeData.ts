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