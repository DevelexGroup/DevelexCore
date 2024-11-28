/**
 * Represents a 2D point with x,y coordinates
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * Calculates the Euclidean distance between two points
 * @param point1 First point with x,y coordinates
 * @param point2 Second point with x,y coordinates
 * @returns Distance between the points in the same units as input coordinates
 */
export const calculatePointDistance = (point1: Point2D, point2: Point2D): number => {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + 
        Math.pow(point2.y - point1.y, 2)
    );
}; 