import { type GazeInteractionEvents, GazeInteraction } from "./GazeInteraction";

export abstract class GazeInteractionScreen<TInteractionEvents extends GazeInteractionEvents, TInputData extends { type: string; }> extends GazeInteraction<TInteractionEvents, TInputData> {}