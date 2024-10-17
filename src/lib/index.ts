/**
 * Imports
 * ================================
 */

import type { EventMap } from './Emitter/Emitter';
import type { GazeInteraction } from './GazeInteraction/GazeInteraction';
import type { GazeInteractionObject } from './GazeInteraction/GazeInteractionObject';
import type { GazeInteractionObjectListenerPayload } from "./GazeInteraction/GazeInteractionObject.settings";

/**
 * @module GazeManager
 * 0. GazeManager
 * ================================
 * 0.1. The main facade of the library. Wraps all the functionality of the library.
 * -------------------------------
*/
export { GazeManager } from '$lib/GazeManager/GazeManager.js';


/**
 * @module GazeInput
 * 1. Gaze Input objects and its events.
 * ================================
 * 1.1 The main functionality of the library. Creating an instance of an eye tracking input.
 *     And facade for the input.
 * -------------------------------
 */ 

export { createGazeInput } from '$lib/GazeInput/index.js';
export { GazeInputFacade } from '$lib/GazeInput/GazeInputFacade.js';

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

export type { GazeInteraction };

export interface GazeInteractionComponentProps<TInteractionEvents extends EventMap, TInputData extends { type: string}, TListenerPayload extends GazeInteractionObjectListenerPayload> {
    gazeInteractionObject: GazeInteractionObject<TInteractionEvents, TInputData, TListenerPayload>;
    settings: Partial<TListenerPayload['listener']['settings']>;
}

export type GazeInteractionComponentPropsDefault = GazeInteractionComponentProps<EventMap, { type: string }, GazeInteractionObjectListenerPayload>

/**
 * 2.2. Dwell interaction.
 * -------------------------------
 */

export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/GazeInteractionObjectDwell.js';
export type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObjectDwell.event.js';
export type { GazeInteractionDwellSettingsType } from '$lib/GazeInteraction/GazeInteractionObjectDwell.settings.js';

/**
 * 2.3. Fixation interaction.
 * -------------------------------
 */

/**
 * 2.3.1. Fixation object.
 * -------------------------------
 */

export { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObjectFixation.js';
export type { GazeInteractionObjectFixationEvents,
    GazeInteractionObjectFixationEvent} from '$lib/GazeInteraction/GazeInteractionObjectFixation.event.js';
export type { GazeInteractionObjectFixationSettings } from '$lib/GazeInteraction/GazeInteractionObjectFixation.settings.js';

/**
 * 2.3.2. Fixation screen.
 * -------------------------------
 */

export { GazeInteractionScreenFixation } from '$lib/GazeInteraction/GazeInteractionScreenFixation.js';
export type { GazeInteractionScreenFixationEvents,
    GazeInteractionScreenFixationEvent} from '$lib/GazeInteraction/GazeInteractionScreenFixation.event.js';

/**
 * 2.4. Saccade interaction.
 * -------------------------------
 * 2.4.1. Saccade object.
 * -------------------------------
 */

export { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.js';
export type { GazeInteractionObjectSaccadeEvents,
    GazeInteractionObjectSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.event.js';
export type { GazeInteractionObjectSaccadeSettings } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.settings.js';

/**
 * 2.4.2. Saccade screen.
 * -------------------------------
 */

export { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/GazeInteractionScreenSaccade.js';
export type { GazeInteractionScreenSaccadeEvents,
    GazeInteractionScreenSaccadeEvent} from '$lib/GazeInteraction/GazeInteractionScreenSaccadeEvent.js';


/**
 * 2.5 Validation interaction.
 * -------------------------------
 */

export { GazeInteractionObjectValidation } from '$lib/GazeInteraction/GazeInteractionObjectValidation.js';
export type { GazeInteractionObjectValidationSettings } from '$lib/GazeInteraction/GazeInteractionObjectValidation.settings.js';

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