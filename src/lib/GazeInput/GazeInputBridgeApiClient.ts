import type { SendToWorkerMessages, ReceiveMessagePayload, ReceiveErrorPayload, ReceiveResponsePayload, GazeDataPayload, ReceiveFromWebSocketMessages } from './GazeInputBridge.types';
import { Emitter, type EventMap } from '$lib/Emitter/Emitter';

interface WebSocketEvents extends EventMap {
    message: ReceiveMessagePayload;
    error: ReceiveErrorPayload;
    response: ReceiveResponsePayload;
    gaze: GazeDataPayload;
}

export class GazeInputBridgeApiClient extends Emitter<WebSocketEvents> {
    private websocket: WebSocket | null = null;

    public async openConnection(uri: string): Promise<this> {
        if (this.websocket) {
            await this.closeConnection();
        }   
        return new Promise((resolve, reject) => {
            this.websocket = new WebSocket(uri);
            
            this.websocket.onopen = () => {
                resolve(this);
            };

            // Add connection error handler
            this.websocket.onerror = (error) => {
                reject(error);
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as ReceiveFromWebSocketMessages;
                    console.log('Received message:', data);
                    this.emit(data.type, data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
        });
    }

    public async closeConnection(): Promise<this> {
        return new Promise((resolve) => {
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }
            resolve(this);
        });
    }

    public send(message: SendToWorkerMessages) {
        console.log('Sending message:', message);
        if (!this.websocket) {
            throw new Error('WebSocket is not connected');
        }
        this.websocket.send(JSON.stringify(message));
    }
} 