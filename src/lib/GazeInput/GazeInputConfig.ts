export type GazeInputConfig = GazeInputConfigBridge | GazeInputConfigDummy;

/**
 * An eye tracker input that emits fixations.
 * This is a type alias for an instance of {@link GazeInput} with a configuration that emits fixations.
 */
export type GazeInputConfigWithFixations = GazeInputConfig & { fixationDetection: 'device' | 'idt' };

export type GazeInputConfigBridge = GazeInputConfigGazePoint | GazeInputConfigEyelogic | GazeInputConfigAsee;

/**
 * Configuration for the input of GazePoint remote eye tracker.
 * @property type - The type of the input, 'gazepoint'.
 * @property uri - The URI of the DeveLex Bridge WebSocket server.
 * @property fixationDetection - The fixation detection method, either 'none' or 'device'.
 */ 
export type GazeInputConfigGazePoint = {
    tracker: 'gazepoint';
    uri: string;
    fixationDetection: 'none' | 'device' | 'idt';
};

/**
 * Configuration for the input of Eyelogic remote eye tracker.
 * @property type - The type of the input, 'eyelogic'.
 * @property uri - The URI of the DeveLex Bridge WebSocket server.
 * @property fixationDetection - The fixation detection method, either 'none' or 'device'.
 */ 
export type GazeInputConfigEyelogic = {
    tracker: 'eyelogic';
    uri: string;
    fixationDetection: 'none' | 'idt' | 'device';
};

/**
 * Configuration for the input of asee remote eye tracker.
 * @property type - The type of the input, 'asee'.
 * @property uri - The URI of the DeveLex Bridge WebSocket server.
 * @property fixationDetection - The fixation detection method, either 'none' or 'idt'.
 */ 
export type GazeInputConfigAsee = {
    tracker: 'asee';
    uri: string;
    fixationDetection: 'none' | 'idt';
};

/**
 * Configuration for the dummy input.
 * @property type - The type of the input, 'dummy'.
 * @property frequency - The frequency of the dummy input in Hz.
 * @property precisionMinimalError - The minimal error of the dummy input in px.
 * @property precisionDecayRate - The decay rate of the precision of the dummy input in px per frame.
 * @property precisionMaximumError - The cap of the precision decay of the dummy input in px.
 */
export type GazeInputConfigDummy = {
    tracker: 'dummy';
    fixationDetection: 'none' | 'idt';
    frequency: number;
    precisionMinimalError: number;
    precisionDecayRate: number;
    precisionMaximumError: number;
}
