import type { GazeInteractionObjectValidationEvent } from "$lib/GazeInteraction/Object/GazeInteractionObjectValidation.event";

export type Validation = Omit<GazeInteractionObjectValidationEvent, 'gazeDataPoints' >;