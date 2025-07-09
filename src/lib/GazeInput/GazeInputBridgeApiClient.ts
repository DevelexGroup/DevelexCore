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
    private isClosing: boolean = false;
    private connectionAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 3;
    private readonly RECONNECT_DELAY_MS = 200; // 1 second

    private emitError(content: string, timestamp?: string) {
        this.emit('error', {
            type: 'error',
            content,
            timestamp: timestamp ?? createISO8601Timestamp()
        });
    }

    public async openConnection(uri: string): Promise<this> {
        if (this.websocket) {
            await this.closeConnection();
        }   
        return new Promise((resolve, reject) => {
            try {
                this.websocket = new WebSocket(uri);
                this.isClosing = false;
                this.connectionAttempts = 1;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error instantiating WebSocket';
                this.emitError(message);
                return reject(error);
            }
            
            this.websocket.onopen = () => {
                this.connectionAttempts = 0;
                resolve(this);
            };

            // Add connection error handler
            this.websocket.onerror = (error) => {
                const timestamp = createISO8601Timestamp();
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.emitError(message, timestamp);
                reject(error);
            };

            this.websocket.onclose = async (event) => {
                // Don't attempt to reconnect if we initiated the close
                if (this.isClosing) {
                    return;
                }

                const timestamp = createISO8601Timestamp();
                if (event?.code !== 1000) {
                    const content = event?.reason ?? 'Connection to Bridge closed unexpectedly';
                    this.emitError(content, timestamp);

                    // Attempt to reconnect if we haven't exceeded the maximum attempts
                    if (this.connectionAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                        this.connectionAttempts++;
                        this.emitError(`Attempting to reconnect (attempt ${this.connectionAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`, timestamp);
                        
                        // Wait before attempting to reconnect
                        await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY_MS));
                        try {
                            await this.openConnection(uri);
                        } catch (error) {
                            // Error handling is done in the openConnection method
                            void error;
                        }
                    } else {
                        this.emitError('Maximum reconnection attempts reached. Please check your connection and try again.', timestamp);
                    }
                }
            };

            this.websocket.onmessage = (event) => {
                try {
                    // Check if the connection is still open before processing
                    if (this.websocket?.readyState !== WebSocket.OPEN) {
                        this.emitError('Received message while WebSocket is not open');
                        return;
                    }

                    const data = JSON.parse(event.data) as ReceiveFromWebSocketMessages;
                    this.emit(data.type, data);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown parsing error';
                    this.emitError(`Failed to parse WebSocket message: ${message}`);
                }
            };
        });
    }

    public async closeConnection(): Promise<this> {
        return new Promise((resolve) => {
            if (this.websocket) {
                this.isClosing = true;
                this.websocket.close(1000, 'Close from client');
                this.websocket = null;
            }
            resolve(this);
        });
    }

    public send(message: SendToWorkerMessages) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected or not in an open state');
        }

        try {
            const messageStr = JSON.stringify(message);
            this.websocket.send(messageStr);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to serialize or send message: ${errorMessage}`);
        }
    }
} 