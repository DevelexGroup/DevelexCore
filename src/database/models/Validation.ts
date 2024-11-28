import type { GazeInteractionObjectValidationEvent } from "$lib/GazeInteraction/GazeInteractionObjectValidation.event";

export type Validation = Omit<GazeInteractionObjectValidationEvent, 'gazeDataPoints' >;