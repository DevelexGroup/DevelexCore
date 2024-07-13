import { Emitter, type EventMap } from '$lib/Emitter/Emitter';

export interface GazeInteractionEvents extends EventMap {
    'connect': {
        type: 'connect';
        value: boolean;
    }
}

export abstract class GazeInteraction<
    TInteractionEvents extends GazeInteractionEvents,
    TInputData
> extends Emitter<TInteractionEvents> {

    readonly inputCallback: (data: TInputData) => void = (data) =>
		this.evaluateInputData(data);

    /**
     * Unknown arguments to connect.
     */
    abstract connect(...args: unknown[]): void;

    abstract disconnect(...args: unknown[]): void;

    abstract evaluateInputData(data: TInputData): void;
}