import type { SendToWorkerMessages, ReceiveMessagePayload, ReceiveErrorPayload, ReceiveResponsePayload, GazeDataPayload, ReceiveFromWebSocketMessages, FixationDataPayload } from './GazeInputBridge.types';
import { Emitter, type EventMap } from '$lib/Emitter/Emitter';
import { createISO8601Timestamp } from '$lib/utils/timeUtils';

interface WebSocketEvents extends EventMap {
    message: ReceiveMessagePayload;
    error: ReceiveErrorPayload;
    response: ReceiveResponsePayload;
    gaze: GazeDataPayload;
    fixationStart: FixationDataPayload;
    fixationEnd: FixationDataPayload;
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
                const timestamp = createISO8601Timestamp();
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.emit('error', {
                    type: 'error',
                    content: message,
                    timestamp
                });
                reject(error);
            };

            this.websocket.onclose = (event) => {
                // 1000 is the code for a normal close
                if (event?.code !== 1000) {
                    const content = event?.reason ?? 'Connection to Bridge closed for unknown reason';
                    const timestamp = createISO8601Timestamp();
                    this.emit('error', {
                        type: 'error',
                        content,
                        timestamp
                    });
                }
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
                this.websocket.close(1000, 'Close from client');
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