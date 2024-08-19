
export interface GazeInteractionObjectListenerPayload {
	data: unknown;
	listener: GazeInteractionObjecListener;
}

export interface GazeInteractionObjecListener {
	settings: object;
	element: Element;
}

