import type { GazeInteractionObjectDwellEvent } from "$lib/GazeInteraction/GazeInteractionObjectDwell.event";

export interface Dwell extends Omit<GazeInteractionObjectDwellEvent, "target" | "settings"> {
    aoi: string;
    id?: number;
}