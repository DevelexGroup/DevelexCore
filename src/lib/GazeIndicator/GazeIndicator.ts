/**
 * Display a cross on the monitor where the user is currently looking, especially for debugging purposes.
 * It is not recommended to use this in production.
 * Uses canvas to draw the gaze points which slowly fade away.
 */

import { type GazeDataPoint } from "$lib/GazeData/GazeData";

export class GazeIndicator {

	canvas: HTMLCanvasElement | null;
	ctx: CanvasRenderingContext2D | null;
	gazeHistory: { x: number; y: number; opacity: number }[];
	fadeRate: number;
	color: string;
	draw: (recentPoint: GazeDataPoint) => void;

	constructor(color: string = 'red', fadeRate: number = 0.05) {
		this.canvas = null;
		this.ctx = null;
		this.gazeHistory = [];
		this.fadeRate = fadeRate;
		this.color = color;
		this.draw = this.createErroneousDrawFunction();
	}

	/**
	 * Initialize the gaze indicator
	 */
	init(document: Document) {
		this.canvas = document.createElement('canvas');
		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get 2d context from canvas');
		}
		this.ctx = ctx;
		this.canvas.style.position = 'fixed';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.canvas.style.pointerEvents = 'none';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		document.body.appendChild(this.canvas);
		this.draw = this.getNewDrawFunction();
	}

	/**
	 * Returns a function that draws the gaze indicator on the screen
	 */
	getNewDrawFunction() {
		if (!this.ctx) {
			throw new Error('Canvas context is not initialized');
		}
		return (recentPoint: GazeDataPoint ) => {
			this.gazeHistory = drawGazeIndicator(this.gazeHistory, this.ctx as CanvasRenderingContext2D, recentPoint.x, recentPoint.y, 10, 1, this.color);
		};
	}

	createErroneousDrawFunction() {
		return () => {
			throw new Error('Canvas context is not initialized');
		};
	}

	/**
	 * Remove the gaze indicator from the screen
	 */
	remove() {
		if (this.canvas) {
			this.canvas.remove();
		}
		this.canvas = null;
		this.ctx = null;
		this.gazeHistory = [];
		this.draw = this.createErroneousDrawFunction();
	}
}


export const drawGazeIndicator = (gazeHistory: { x: number; y: number; opacity: number }[], ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number, color: string) => {
	// clear canvas
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const newGazeHistory = [];

	// draw all previous gaze points with reduced opacity by fadeRate
	for (let i = 0; i < gazeHistory.length; i++) {
		const point = gazeHistory[i];
		const newOpacity = point.opacity - 0.05;
		if (newOpacity > 0) {
			newGazeHistory.push({ x: point.x, y: point.y, opacity: newOpacity });
			drawGazeIndicatorMarkerCircle(ctx, point.x, point.y, 10, newOpacity, color);
		}
	}

	// add the recent gaze point to the history
	newGazeHistory.push({ x, y, opacity: 1 });

	drawGazeIndicatorMarkerCircle(ctx, x, y, 10, 1, color);

	return newGazeHistory;
};


export const drawGazeIndicatorMarkerCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number, color: string) => {
	ctx.fillStyle = color;
	ctx.globalAlpha = opacity;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fill();
};
