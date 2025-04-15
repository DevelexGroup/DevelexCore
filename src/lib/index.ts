/**
 * @module Emitter
 * ================================
 * Base event emitter functionality used throughout the library.
 * Provides core event handling capabilities for all gaze-related components.
 */
export { 
    Emitter,
    EmitterGroup 
} from '$lib/Emitter/Emitter.js';
export type { EventMap } from '$lib/Emitter/Emitter.js';

/**
 * @module GazeManager
 * ================================
 * The main facade of the library that coordinates all gaze-related functionality.
 * Provides a centralized way to manage eye tracking inputs, interactions, and calibration.
 */
export { GazeManager } from '$lib/GazeManager/GazeManager.js';
export type { GazeManagerRegistration } from '$lib/GazeManager/GazeManager.js';

/**
 * @module GazeInput
 * ================================
 * Core functionality for handling eye tracking device inputs.
 * Provides interfaces and implementations for different eye tracking devices.
 */

/**
 * Factory function to create appropriate gaze input handler based on configuration
 */
export { createGazeInput } from '$lib/GazeInput/index.js';

/**
 * Main interface for interacting with eye tracking devices
 */
export { GazeInputFacade } from '$lib/GazeInput/GazeInputFacade.js';

/**
 * Configuration types for different eye tracking devices and scenarios
 */
export type { 
    GazeInputConfig,
    GazeInputConfigGazePoint,
    GazeInputConfigEyelogic,
    GazeInputConfigAsee,
    GazeInputConfigDummy,
    GazeInputConfigWithFixations 
} from '$lib/GazeInput/GazeInputConfig.js';

/**
 * Event types and interfaces for gaze input state management
 */
export type { 
    GazeInputEventState,
    GazeInputEventError,
    GazeInputEventMessage,
    GazeInputEvents,
} from '$lib/GazeInput/GazeInputEvent.js';

/**
 * @module GazeInteraction
 * ================================
 * Components and types for handling different types of gaze interactions.
 * Includes implementations for fixations, saccades, dwell time, and validation.
 */

/**
 * Base types for gaze interactions
 */
export type { GazeInteraction } from '$lib/GazeInteraction/GazeInteraction.js';
export type { GazeInteractionObject } from '$lib/GazeInteraction/GazeInteractionObject.js';
export type { GazeInteractionEvent } from '$lib/GazeInteraction/GazeInteraction.event.js';


/**
 * Dwell-based interaction implementation
 * Tracks how long a user's gaze remains on an element
 */
export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/GazeInteractionObjectDwell.js';
export type { GazeInteractionObjectDwellEvent } from '$lib/GazeInteraction/GazeInteractionObjectDwell.event.js';
export type { GazeInteractionDwellSettingsType } from '$lib/GazeInteraction/GazeInteractionObjectDwell.settings.js';

/**
 * Fixation-based interaction implementation
 * Detects when a user's gaze stabilizes on an element
 */
export { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObjectFixation.js';
export type { 
    GazeInteractionObjectFixationEvents,
    GazeInteractionObjectFixationEvent
} from '$lib/GazeInteraction/GazeInteractionObjectFixation.event.js';
export type { GazeInteractionObjectFixationSettings } from '$lib/GazeInteraction/GazeInteractionObjectFixation.settings.js';

/**
 * Saccade-based interaction implementation
 * Detects rapid eye movements between fixation points
 */
export { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.js';
export type { 
    GazeInteractionObjectSaccadeEvents,
    GazeInteractionObjectSaccadeEvent 
} from '$lib/GazeInteraction/GazeInteractionObjectSaccade.event.js';
export type { GazeInteractionObjectSaccadeSettings } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.settings.js';

/**
 * Screen-level saccade detection
 */
export { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/GazeInteractionScreenSaccade.js';
export type { 
    GazeInteractionScreenSaccadeEvents,
    GazeInteractionScreenSaccadeEvent
} from '$lib/GazeInteraction/GazeInteractionScreenSaccade.event.js';

/**
 * Validation interaction implementation
 * Provides accuracy and precision measurements for gaze tracking
 */
export { GazeInteractionObjectValidation } from '$lib/GazeInteraction/GazeInteractionObjectValidation.js';
export type { 
    GazeInteractionObjectValidationEvents,
    GazeInteractionObjectValidationEvent 
} from '$lib/GazeInteraction/GazeInteractionObjectValidation.event.js';
export type { GazeInteractionObjectValidationSettings } from '$lib/GazeInteraction/GazeInteractionObjectValidation.settings.js';

/**
 * Intersection-based interaction implementation
 * Detects when a user's gaze intersects with elements
 */
export { GazeInteractionObjectIntersect } from '$lib/GazeInteraction/GazeInteractionObjectIntersect.js';
export type { GazeInteractionObjectIntersectEvent } from '$lib/GazeInteraction/GazeInteractionObjectIntersect.event.js';
export type { GazeInteractionObjectIntersectSettingsType } from '$lib/GazeInteraction/GazeInteractionObjectIntersect.settings.js';

/**
 * @module GazeIndicator
 * ================================
 * Visual feedback component for gaze position
 * Useful for debugging and providing user feedback
 */
export { GazeIndicator } from '$lib/GazeIndicator/GazeIndicator.js';

/**
 * @module GazeData
 * ================================
 * Core data types and utilities for handling gaze data points
 */
export { type GazeInput } from '$lib/GazeInput/GazeInput.js';
export { 
    type GazeDataPoint 
} from '$lib/GazeData/GazeData.js';

/**
 * @module GazeWindowCalibrator
 * ================================
 * Utilities for calibrating gaze data to window coordinates
 */
export { GazeWindowCalibrator } from '$lib/GazeWindowCalibrator/GazeWindowCalibrator.js';
export type { 
    GazeWindowCalibratorConfig,
    GazeWindowCalibratorConfigMouseEventFields,
    GazeWindowCalibratorConfigWindowFields 
} from '$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig.js';

/**
 * @module GazeFixationDetector
 * ================================
 * Utilities for detecting and analyzing fixations
 */
export { 
    getMaxDispersion,
    getSizeInCentimetersFromDegrees,
    getSizeInPixelsFromCentimeters 
} from '$lib/GazeFixationDetector/GazeFixationDetectorIDT.js';