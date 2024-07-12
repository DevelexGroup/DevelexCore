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
    abstract connect(...args: any[]): void;

    abstract disconnect(...args: any[]): void;

    abstract evaluateInputData(data: TInputData): void;
}