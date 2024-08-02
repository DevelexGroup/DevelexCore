import { GazeFixationDetectorDevice } from './GazeFixationDetectorDevice';
import { GazeFixationDetectorIDT } from './GazeFixationDetectorIDT';

export const createGazeFixationDetector = (detectorType: 'none' | 'device' | 'idt') => {
    switch (detectorType) {
        case 'none':
            return new GazeFixationDetectorDevice(); // same as 'device', this is intentional, see the warning in GazeFixationDetectorDevice
        case 'device':
            return new GazeFixationDetectorDevice();
        case 'idt':
            return new GazeFixationDetectorIDT();
        default:
            throw new Error(`Unknown gaze fixation detector type: ${detectorType}`);
    }
}