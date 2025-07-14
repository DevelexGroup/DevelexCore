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

	/** Stores the latest gaze point until it is rendered in the next animation frame */
	lastGazePoint: GazeDataPoint | null;
	/** The id returned by requestAnimationFrame so it can be cancelled */
	animationFrameId: number | null;

	constructor(color: string = 'red', fadeRate: number = 0.05) {
		this.canvas = null;
		this.ctx = null;
		this.gazeHistory = [];
		this.fadeRate = fadeRate;
		this.color = color;
		this.draw = this.createErroneousDrawFunction();
		this.lastGazePoint = null;
		this.animationFrameId = null;
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
		this.canvas.style.zIndex = '9999';
		this.resize(document);
		document.body.appendChild(this.canvas);
		// Start rendering in the next animation frame
		this.startRenderLoop();
		this.draw = this.getNewDrawFunction();
	}

	resize(document: Document) {
		if (this.canvas) {
			this.canvas.width = document.documentElement.clientWidth;
			this.canvas.height = document.documentElement.clientHeight;
		}
	}

	/**
	 * Returns a function that draws the gaze indicator on the screen
	 */
	getNewDrawFunction() {
		if (!this.ctx) {
			throw new Error('Canvas context is not initialized');
		}
		// Only store the latest point; actual drawing happens inside requestAnimationFrame
		return (recentPoint: GazeDataPoint) => {
			this.lastGazePoint = recentPoint;
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
		// Stop the animation loop if it is running
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}


/* ----------------------- Internal rendering loop ----------------------- */

	private startRenderLoop() {
		const render = () => {
			if (!this.ctx) {
				this.animationFrameId = null;
				return;
			}

			// Clear the entire canvas for fresh drawing
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

			const newHistory: { x: number; y: number; opacity: number }[] = [];

			// Fade existing points
			for (let i = 0; i < this.gazeHistory.length; i++) {
				const point = this.gazeHistory[i];
				const newOpacity = point.opacity - this.fadeRate;
				if (newOpacity > 0) {
					newHistory.push({ x: point.x, y: point.y, opacity: newOpacity });
					drawGazeIndicatorMarkerCircle(this.ctx, point.x, point.y, 10, newOpacity, this.color);
				}
			}

			// Draw the latest gaze point, if any
			if (this.lastGazePoint) {
				newHistory.push({ x: this.lastGazePoint.x, y: this.lastGazePoint.y, opacity: 1 });
				drawGazeIndicatorMarkerCircle(this.ctx, this.lastGazePoint.x, this.lastGazePoint.y, 10, 1, this.color);
				// Reset after rendering
				this.lastGazePoint = null;
			}

			// Update history reference
			this.gazeHistory = newHistory;

			// Ensure alpha channel is reset for the next draw cycle
			this.ctx.globalAlpha = 1;

			// Queue next frame
			this.animationFrameId = requestAnimationFrame(render);
		};

		// Kick off the first frame
		this.animationFrameId = requestAnimationFrame(render);
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
