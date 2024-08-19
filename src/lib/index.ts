/**
 * Imports
 * ================================
 */

import type { GazeInteractionEvents, GazeInteraction } from './GazeInteraction/GazeInteraction';
import type { GazeInteractionObject } from './GazeInteraction/Object/GazeInteractionObject';
import type { GazeInteractionObjectListenerPayload } from "./GazeInteraction/Object/GazeInteractionObject.settings";

/**
 * @module GazeInput
 * 1. Gaze Input objects and its events.
 * ================================
 * 1.1 The main functionality of the library. Creating an instance of an eye tracking input. Immutable!
 * -------------------------------
 */ 

export { createGazeInput } from '$lib/GazeInput/index.js';

/**
 * 1.2 Configuration types for the input.
 * -------------------------------
 */

export type { GazeInputConfig, GazeInputConfigGazePoint, GazeInputConfigSMI, GazeInputConfigEyelogic, GazeInputConfigDummy, GazeInputConfigWithFixations } from '$lib/GazeInput/GazeInputConfig.js';

/**
 * @module GazeInteraction
 * 2. Gaze Interaction objects and its events.
 * ================================
 * 2.1. Abstract types and classes.
 * -------------------------------
 */

export type { GazeInteractionEvents, GazeInteraction };

export interface GazeInteractionComponentProps<TInteractionEvents extends GazeInteractionEvents, TInputData extends { type: string}, TListenerPayload extends GazeInteractionObjectListenerPayload> {
    gazeInteractionObject: GazeInteractionObject<TInteractionEvents, TInputData, TListenerPayload>;
    settings: Partial<TListenerPayload['listener']['settings']>;
}

export type GazeInteractionComponentPropsDefault = GazeInteractionComponentProps<GazeInteractionEvents, { type: string }, GazeInteractionObjectListenerPayload>

/**
 * 2.2. Dwell interaction.
 * -------------------------------
 */

export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/Object/GazeInteractionObjectDwell.js';
export type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/Object/GazeInteractionObjectDwell.event.js';
export type { GazeInteractionDwellSettingsType } from '$lib/GazeInteraction/Object/GazeInteractionObjectDwell.settings.js';

/**
 * 2.3. Fixation interaction.
 * -------------------------------
 */

/**
 * 2.3.1. Fixation object.
 * -------------------------------
 */

export { GazeInteractionObjectFixation } from '$lib/GazeInteraction/Object/GazeInteractionObjectFixation.js';
export type { GazeInteractionObjectFixationEvents,
    GazeInteractionObjectFixationEvent} from '$lib/GazeInteraction/Object/GazeInteractionObjectFixation.event.js';
export type { GazeInteractionObjectFixationSettings } from '$lib/GazeInteraction/Object/GazeInteractionObjectFixation.settings.js';

/**
 * 2.3.2. Fixation screen.
 * -------------------------------
 */

export { GazeInteractionScreenFixation } from '$lib/GazeInteraction/Screen/GazeInteractionScreenFixation.js';
export type { GazeInteractionScreenFixationEvents,
    GazeInteractionScreenFixationEvent} from '$lib/GazeInteraction/Screen/GazeInteractionScreenFixation.event.js';

/**
 * 2.4. Saccade interaction.
 * -------------------------------
 * 2.4.1. Saccade object.
 * -------------------------------
 */

export { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/Object/GazeInteractionObjectSaccade.js';
export type { GazeInteractionObjectSaccadeEvents,
    GazeInteractionObjectSaccadeEvent } from '$lib/GazeInteraction/Object/GazeInteractionObjectSaccade.event.js';
export type { GazeInteractionObjectSaccadeSettings } from '$lib/GazeInteraction/Object/GazeInteractionObjectSaccade.settings.js';

/**
 * 2.4.2. Saccade screen.
 * -------------------------------
 */

export { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/Screen/GazeInteractionScreenSaccade.js';
export type { GazeInteractionScreenSaccadeEvents,
    GazeInteractionScreenSaccadeEvent} from '$lib/GazeInteraction/Screen/GazeInteractionScreenSaccadeEvent.js';


/**
 * 2.5 Validation interaction.
 * -------------------------------
 */

export { GazeInteractionObjectValidation } from '$lib/GazeInteraction/Object/GazeInteractionObjectValidation.js';
export type { GazeInteractionObjectValidationSettings } from '$lib/GazeInteraction/Object/GazeInteractionObjectValidation.settings.js';

/**
 * @module GazeIndicator
 * 3. GazeIndicator
 * ================================
 */

export { GazeIndicator } from '$lib/GazeIndicator/GazeIndicator.js';

/**
 * @module GazeData
 * 4. GazeData
 * ================================
 */

export { type GazeInput, isGazeInputWithFixations } from '$lib/GazeInput/GazeInput.js';

export { type GazeDataPoint, type GazeDataPointWithFixation, isGazeDataPointWithFixation } from '$lib/GazeData/GazeData.js';

/**
 * @module GazeWindowCalibrator
 * 5. GazeWindowCalibrator
 * ================================
 */

export { GazeWindowCalibrator } from '$lib/GazeWindowCalibrator/GazeWindowCalibrator.js';
export type { GazeWindowCalibratorConfig, GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from '$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js';