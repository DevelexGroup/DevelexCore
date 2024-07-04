import { GazeInput } from '../GazeInput/GazeInput';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';

export abstract class GazeInteraction {
    abstract start(gazeInput: GazeInput<GazeInputConfig>): void;
    abstract stop(): void;
    abstract register(element: Element, settings: Object): void;
    abstract unregister(element: Element): void;
}