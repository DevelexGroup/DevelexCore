import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInput } from "$lib/GazeInput/GazeInput";
import type { GazeInputConfig } from "$lib/GazeInput/GazeInputConfig";
import { GazeInteractionObject } from "./GazeInteractionObject";
import type { GazeInteractionObjectValidationEvent, GazeInteractionObjectValidationEvents } from "./GazeInteractionObjectValidationEvent";
import type { GazeInteractionObjectValidationListener, GazeInteractionObjectValidationPayload, GazeInteractionObjectValidationSettings } from "./GazeInteractionObjectValidationSettings";

/**
 * Beware! Registering an element for validation events will start the validation process immediately.
 * After the end, it will unregister itself immediately.
 * 
 * To signify the difference to other InteractionObjects, the register method is aliased to validate.
 * Thus, you can use the validate method to start the validation process.
 * However, the register method is still available to be used.
 * 
 * @example
 * const validation = new GazeInteractionObjectValidation();
 * validation.validate(element, {
 *    accuracyTolerance: 50,
 *    validationDuration: 1000,
 *    onValidation: (event) => {
 *       console.log(event.accuracy, event.precision);
 *    }
 * });
 */
export class GazeInteractionObjectValidation extends GazeInteractionObject<
    GazeInteractionObjectValidationEvents,
    GazeDataPoint,
    GazeInteractionObjectValidationPayload
> {

    defaultSettings: GazeInteractionObjectValidationSettings = {
        accuracyTolerance: 50,
        validationDuration: 1000,
        onValidation: () => {}
    };

    register(element: Element, settings: Partial<GazeInteractionObjectValidationSettings>): void {
        const mergedSettings = { ...this.defaultSettings, ...settings };
        this.listeners.push(this.generateListener(element, mergedSettings));
        setTimeout(() => {
            const listener = this.listeners.find((l) => l.element === element);
            console.log('Validation ended', listener);
            if (listener) {
                const accuracy = calculateAccuracy(listener.gazeDataPoints.map((d) => ({ x: d.x, y: d.y })));
                const precision = calculatePrecision(listener.gazeDataPoints.map((d) => ({ x: d.x, y: d.y })));
                const sessionId = listener.gazeDataPoints[0]?.sessionId ?? 'INVALID_SESSION_ID';
                const timestamp = Date.now();
                const allDataPointsCount = listener.gazeDataPoints.length;
                const validDataPointsCount = listener.gazeDataPoints.filter((d) => d.validityL || d.validityR).length;
                const validDataPointsPercentage = validDataPointsCount / allDataPointsCount;
                const isValid = accuracy <= listener.settings.accuracyTolerance;
                const validationEvent: GazeInteractionObjectValidationEvent = { 
                    type: 'validation',
                    accuracy,
                    precision,
                    isValid,
                    validationDuration: listener.settings.validationDuration,
                    allDataPointsCount,
                    validDataPointsCount,
                    validDataPointsPercentage,
                    sessionId,
                    timestamp,
                    gazeDataPoints: listener.gazeDataPoints
                };
                listener.settings.onValidation(validationEvent);
                this.emit('validation', validationEvent);
            }
            this.unregister(element);
        }, mergedSettings.validationDuration);
    }

    /**
     * Alias for register.
     * @param element 
     * @param settings 
     */
    validate(element: Element, settings: Partial<GazeInteractionObjectValidationSettings>): void {
        this.register(element, settings);
    }

    connect(input: GazeInput<GazeInputConfig>): void {
        input.on('data', this.inputCallback);
    }

    disconnect(input: GazeInput<GazeInputConfig>): void {
        input.off('data', this.inputCallback);
    }

    generateListener(element: Element, settings: GazeInteractionObjectValidationSettings): GazeInteractionObjectValidationListener {
        return {
            element,
            settings,
            gazeDataPoints: []
        };
    }

    evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectValidationListener): void {
        console.log('Validation data', data);
        listener.gazeDataPoints.push(data);
    }
}



type Point = { x: number, y: number };

/**
 * Calculates the Euclidean distance between two points.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The Euclidean distance between the points.
 */
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/**
 * Calculates the average distance of points from the origin (0, 0), representing accuracy.
 * @param points - Array of points.
 * @returns The average distance from the origin.
 */
export const calculateAccuracy = (points: Point[]): number => {
  const origin: Point = { x: 0, y: 0 };
  const totalDistance = points.reduce((sum, point) => sum + distance(point, origin), 0);
  return totalDistance / points.length;
};

/**
 * Calculates the precision as the standard deviation of the distances of the points from their centroid.
 * @param points - Array of points.
 * @returns The standard deviation of the distances from the centroid.
 */
export const calculatePrecision = (points: Point[]): number => {
  const centroid: Point = {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length
  };
  const distances = points.map(point => distance(point, centroid));
  const meanDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - meanDistance, 2), 0) / distances.length;
  return Math.sqrt(variance);
};