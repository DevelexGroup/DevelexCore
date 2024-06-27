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

export type GazePayload = GazePayloadPoint;

export type GazePayloadPoint = GazePayloadPointBase | GazePayloadFixation;

export type GazePayloadPointBase = {
    timestamp: number;
    type: 'point';
    x: number;
    y: number;
    deviceValidity: boolean;
}

export type GazePayloadFixation = GazePayloadPointBase & {
    fixationDuration: number;
    fixationId: number;
}