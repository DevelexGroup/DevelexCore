import type { GazeInteractionObjectDwellEvent } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwellEvent";

export interface Dwell extends Omit<GazeInteractionObjectDwellEvent, "target" | "settings"> {
    aoi: string;
    id?: number;
}