import type { SendToWorkerMessages, ReceiveMessagePayload, ReceiveErrorPayload, ReceiveStatusPayload, GazeDataPayload, ReceiveFromWebSocketMessages } from './GazeInputBridge.types';
import { Emitter, type EventMap } from '$lib/Emitter/Emitter';

interface WebSocketEvents extends EventMap {
    message: ReceiveMessagePayload;
    error: ReceiveErrorPayload;
    status: ReceiveStatusPayload;
    gaze: GazeDataPayload;
}

export class GazeInputBridgeApiClient extends Emitter<WebSocketEvents> {
    private websocket: WebSocket | null = null;

    public openConnection(uri: string) {
        if (this.websocket) {
            this.closeConnection();
        }
        this.websocket = new WebSocket(uri);
        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as ReceiveFromWebSocketMessages;
                this.emit(data.type, data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
    }

    public closeConnection() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    public send(message: SendToWorkerMessages) {
        if (!this.websocket) {
            throw new Error('WebSocket is not connected');
        }
        this.websocket.send(JSON.stringify(message));
    }
} 