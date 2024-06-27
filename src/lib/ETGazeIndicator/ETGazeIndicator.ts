/**
 * Display a cross on the monitor where the user is currently looking, especially for debugging purposes.
 * It is not recommended to use this in production.
 * Uses canvas to draw the gaze points which slowly fade away.
 */

export class ETGazeIndicator {
	document: Document;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	gazeHistory: { x: number; y: number; opacity: number }[];
	fadeRate: number;
	color: string;

	constructor(document: Document, color: string = 'red', fadeRate: number = 0.05) {
		this.document = document;
		this.canvas = this.document.createElement('canvas');
		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get 2d context from canvas');
		}
		this.ctx = ctx;
		this.gazeHistory = [];
		this.fadeRate = fadeRate;
		this.color = color;
	}

	/**
	 * Initialize the gaze indicator
	 */
	init() {
		this.canvas.style.position = 'fixed';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.canvas.style.pointerEvents = 'none';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.document.body.appendChild(this.canvas);
	}

	/**
	 * Draw the gaze indicator
	 */

	draw(recentPoint: { x: number; y: number }) {
		// clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const newGazeHistory = [];

		// draw all previous gaze points with reduced opacity by fadeRate
		for (let i = 0; i < this.gazeHistory.length; i++) {
			const point = this.gazeHistory[i];
			const newOpacity = point.opacity - this.fadeRate;
			if (newOpacity > 0) {
				newGazeHistory.push({ x: point.x, y: point.y, opacity: newOpacity });
				this.drawCircle(point.x, point.y, 10, newOpacity);
			}
		}

		// add the recent gaze point to the history
		newGazeHistory.push({ x: recentPoint.x, y: recentPoint.y, opacity: 1 });

		this.drawCircle(recentPoint.x, recentPoint.y, 10, 1);

		this.gazeHistory = newGazeHistory;
	}

	drawCircle(x: number, y: number, radius: number, opacity: number) {
		this.ctx.fillStyle = this.color;
		this.ctx.globalAlpha = opacity;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fill();
	}

	/**
	 * Remove the gaze indicator from the screen
	 */
	remove() {
		this.canvas.remove();
	}
}
