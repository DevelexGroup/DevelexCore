import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import { GazeInteractionObject } from "./GazeInteractionObject";
import type { GazeInteractionObjectValidationEvents } from "./GazeInteractionObjectValidationEvent";
import type { GazeInteractionObjectValidationPayload } from "./GazeInteractionObjectValidationSettings";

export class GazeInteractionObjectValidation extends GazeInteractionObject<
    GazeInteractionObjectValidationEvents,
    GazeDataPoint,
    GazeInteractionObjectValidationPayload
> {
    
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