import type { ETInput } from './ETInput';

export type ETInputConfig = ETInputConfigGazePoint | ETInputConfigDummy;

/**
 * An eye tracker input that emits fixations.
 * This is a type alias for an instance of {@link ETInput} with a configuration that emits fixations.
 */
export type ETInputConfigWithFixations = ETInputConfigGazePoint & { fixationDetection: 'device' };

/**
 * Configuration for the input of GazePoint remote eye tracker.
 * @property type - The type of the input, 'gazepoint'.
 * @property uri - The URI of the DeveLex Bridge WebSocket server.
 * @property fixationDetection - The fixation detection method, either 'none' or 'device'.
 */ 
export type ETInputConfigGazePoint = {
    type: 'gazepoint';
    uri: string;
    fixationDetection: 'none' | 'device';
};

/**
 * Configuration for the dummy input.
 * @property type - The type of the input, 'dummy'.
 * @property frequency - The frequency of the dummy input in Hz.
 * @property precisionMinimalError - The minimal error of the dummy input in px.
 * @property precisionDecayRate - The decay rate of the precision of the dummy input in px per frame.
 * @property precisionMaximumError - The cap of the precision decay of the dummy input in px.
 */
export type ETInputConfigDummy = {
    type: 'dummy';
    fixationDetection: 'none' | 'device';
    frequency: number;
    precisionMinimalError: number;
    precisionDecayRate: number;
    precisionMaximumError: number;
}
