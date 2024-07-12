import { Emitter, type EventMap } from '$lib/Emitter/Emitter';

export interface GazeInteractionEvents extends EventMap {
    'connect': {
        type: 'connect';
        value: boolean;
    }
}

export abstract class GazeInteraction<
    TInteractionEvents extends GazeInteractionEvents,
    TInputData extends { type: string; }
> extends Emitter<TInteractionEvents> {

    readonly inputCallback: (data: TInputData) => void = (data) =>
		this.evaluateInputData(data);

    abstract connect(input: unknown): void;

    abstract disconnect(input: unknown): void;

    abstract evaluateInputData(data: TInputData): void;
}