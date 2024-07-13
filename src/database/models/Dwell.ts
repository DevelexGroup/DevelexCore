import type { GazeInteractionObjectDwellEvent } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwellEvent";

export interface Dwell extends GazeInteractionObjectDwellEvent {
    aoi: string;
    id?: number;
}