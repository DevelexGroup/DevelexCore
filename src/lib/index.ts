/**
 * Imports
 * ================================
 */

import type { GazeInteractionEvents, GazeInteraction } from './GazeInteraction/GazeInteraction';
import type { GazeInteractionListenerPayload, GazeInteractionObject } from './GazeInteraction/GazeInteractionObject/GazeInteractionObject';

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

export interface GazeInteractionComponentProps<TInteractionEvents extends GazeInteractionEvents, TInputData extends { type: string}, TListenerPayload extends GazeInteractionListenerPayload> {
    gazeInteractionObject: GazeInteractionObject<TInteractionEvents, TInputData, TListenerPayload>;
    settings: Partial<TListenerPayload['listener']['settings']>;
}

export type GazeInteractionComponentPropsDefault = GazeInteractionComponentProps<GazeInteractionEvents, { type: string }, GazeInteractionListenerPayload>

/**
 * 2.2. Dwell interaction.
 * -------------------------------
 */

export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwell.js';
export type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwellEvent.js';
export type { GazeInteractionDwellSettingsType } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwellSettings.js';

/**
 * 2.3. Fixation interaction.
 * -------------------------------
 * 2.3.1. Fixation in object.
 * -------------------------------
 */

export { GazeInteractionObjectInFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInFixation.js';
export type { GazeInteractionObjectFixationInEvents, GazeInteractionObjectFixationInEvent, GazeInteractionObjectFixationInProgressEvent, GazeInteractionObjectFixationInEndEvent, GazeInteractionObjectFixationInStartEvent } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInFixationEvent.js';
export type { GazeInteractionFixationInSettings} from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInFixationSettings.js';

/**
 * 2.3.2. Fixation set object.
 * -------------------------------
 */

export { GazeInteractionObjectSetFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetFixation.js';
export type { GazeInteractionObjectSetFixationEvents,
    GazeInteractionObjectSetFixationEvent,
    GazeInteractionObjectSetFixationProgressEvent,
    GazeInteractionObjectSetFixationEndEvent,
    GazeInteractionObjectSetFixationStartEvent } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetFixationEvent.js';
export type { GazeInteractionObjectSetFixationSettings } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetFixationSettings.js';

/**
 * 2.3.3. Fixation screen.
 * -------------------------------
 */

export { GazeInteractionScreenFixation } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixation.js';
export type { GazeInteractionScreenFixationEvents,
    GazeInteractionScreenFixationEvent,
    GazeInteractionScreenFixationStartEvent,
    GazeInteractionScreenFixationEndEvent,
    GazeInteractionScreenFixationProgressEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixationEvent.js';

/**
 * 2.4. Saccade interaction.
 * -------------------------------
 * 2.4.1. Saccade in object.
 * -------------------------------
 */

export { GazeInteractionObjectInSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInSaccade.js';
export type { GazeInteractionObjectInSaccadeEvents,
    GazeInteractionObjectInSaccadeEvent,
    GazeInteractionObjectInSaccadeToEvent,
    GazeInteractionObjectInSaccadeFromEvent } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInSaccadeEvent.js';
export type { GazeInteractionObjectInSaccadeSettings } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInSaccadeSettings.js';

/**
 * 2.4.2. Saccade set object.
 * -------------------------------
 */

export { GazeInteractionObjectSetSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetSaccade.js';
export type { GazeInteractionObjectSetSaccadeEvents,
    GazeInteractionObjectSetSaccadeEvent,
    GazeInteractionObjectSetSaccadeToEvent,
    GazeInteractionObjectSetSaccadeFromEvent } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetSaccadeEvent.js';
export type { GazeInteractionObjectSetSaccadeSettings } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetSaccadeSettings.js';

/**
 * 2.4.3. Saccade screen.
 * -------------------------------
 */

export { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccade.js';
export type { GazeInteractionScreenSaccadeEvents,
    GazeInteractionScreenSaccadeEvent} from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccadeEvent.js';


/**
 * 2.5 Validation interaction.
 * -------------------------------
 */

export { GazeInteractionObjectValidation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectValidation.js';
export type { GazeInteractionObjectValidationSettings } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectValidationSettings.js';

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