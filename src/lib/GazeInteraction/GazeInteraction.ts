import { GazeInput } from '../GazeInput/GazeInput';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';
import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import { Emitter } from '$lib/Emitter/Emitter';

export type GazeInteractionEvents = {
    'connectInput': {
        type: 'connectInput';
        value: boolean;
    }
}

export abstract class GazeInteraction<T extends GazeInteractionEvents> extends Emitter<T> {
    readonly eyetrackerCallback: (data: GazeDataPoint) => void = (data) =>
		this.evaluateInputData(data);

    connectInput(gazeInput: GazeInput<GazeInputConfig>): void {
        gazeInput.on('data', this.eyetrackerCallback);
    }

    disconnectInput(gazeInput: GazeInput<GazeInputConfig>): void {
        gazeInput.off('data', this.eyetrackerCallback);
    }

    abstract evaluateInputData(data: GazeDataPoint): void;
}