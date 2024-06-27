import { GazeFixationDetectorDevice } from './GazeFixationDetectorDevice';

export const createGazeFixationDetector = (detectorType: 'none' | 'device') =>  {
    switch (detectorType) {
        case 'none':
            return new GazeFixationDetectorDevice(); // same as 'device', this is intentional, see the warning in GazeFixationDetectorDevice
        case 'device':
            return new GazeFixationDetectorDevice();
        default:
            throw new Error(`Unknown gaze fixation detector type: ${detectorType}`);
    }
}