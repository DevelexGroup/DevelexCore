import { Emitter, type EventMap } from '$lib/Emitter/Emitter';

/**
 * Base class for all gaze interaction evaluation,
 * decoupled from the input generator (e.g. eye-tracker), accepting only
 * individual data points for evaluation.
 */
export abstract class GazeInteraction<
    TInteractionEvents extends EventMap,
    TInputData
> extends Emitter<TInteractionEvents> {
    /**
     * Accepts data and evaluates it for gaze interaction events.
     * @param data The eye-tracker data to evaluate. It can be a gaze point, or a fixation event.
     */
    abstract evaluate(data: TInputData): void;
}