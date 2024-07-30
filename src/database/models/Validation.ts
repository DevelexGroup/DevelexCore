import type { GazeInteractionObjectValidationEvent } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectValidationEvent";

export type Validation = Omit<GazeInteractionObjectValidationEvent, 'gazeDataPoints' >;