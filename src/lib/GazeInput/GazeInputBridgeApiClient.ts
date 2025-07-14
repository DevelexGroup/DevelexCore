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

    /**
     * Emit a standardised error payload so we don't repeat timestamp logic everywhere.
     */
    private emitError(content: string): void {
        this.emit('error', {
            type: 'error',
            content,
            timestamp: createISO8601Timestamp(),
        });
    }

    /**
     * Open a WebSocket connection to the bridge.
     *
     * Error-handling philosophy (so callers don’t experience silent failures):
     * 1. Synchronous errors (thrown by the WebSocket constructor, e.g. malformed URI or
     *    blocked protocol) are caught immediately. We emit a single `'error'` event via
     *    `emitError()` **and** reject the returned promise.
     * 2. Asynchronous connection-level errors (`onerror`) are treated the same way: emit
     *    `'error'` and reject the promise.
     * 3. Abnormal remote closures (`onclose` with `code !== 1000`) also emit `'error'`.
     * 4. If the connection opens successfully, the promise resolves and normal operation
     *    continues.
     *
     * Because every failure path (sync or async) ends with at least one `'error'` event
     * *and* a rejected promise, there is no route for a silent failure: either the caller
     * awaiting the promise is notified, an event listener is notified, or both.
     */
    public async openConnection(uri: string): Promise<this> {
        if (this.websocket) {
            await this.closeConnection();
        }   
        return new Promise((resolve, reject) => {
            // Creating a WebSocket can throw synchronously (e.g. malformed URI).
            // Catch that here so callers always get an error event + rejection.
            try {
                this.websocket = new WebSocket(uri);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error in constructing WebSocket in GazeInputBridgeApiClient when connecting to Bridge on ' + uri;
                this.emitError(message);
                reject(error);
                return; // stop further setup
            }
            
            this.websocket.onopen = () => {
                resolve(this);
            };

            // Add connection error handler
            this.websocket.onerror = () => {
                // native Error object is not exposed; provide meaningful fallback
                this.emitError('WebSocket encountered an error when connecting to Bridge on ' + uri);
                reject(new Error('WebSocket error event'));
            };

            this.websocket.onclose = (event) => {
                // 1000 is the code for a normal close
                if (event?.code !== 1000) {
                    const reason = event?.reason && event.reason.trim().length > 0 ? event.reason : `Connection closed abnormally (code ${event.code})`;
                    this.emitError(reason);
                }
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as ReceiveFromWebSocketMessages;
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

    /**
     * Send a message through the active WebSocket connection.
     *
     * Behaviour when the socket is not open:
     * – If `this.websocket` is `null` (never opened or already closed) **or** the
     *   underlying WebSocket is in a CLOSING/CLOSED state, the call throws
     *   synchronously with `Error("WebSocket is not connected")` (or the browser’s
     *   own `DOMException`).
     * – The worker that wraps this client catches that exception and forwards it to
     *   the main thread as `{type: 'error', content: 'Failed to send message to Bridge: …'}`.
     * – Callers awaiting the command therefore get their Promise rejected and also
     *   receive a global `'inputError'` event.
     */
    public send(message: SendToWorkerMessages) {
        if (!this.websocket) {
            throw new Error('WebSocket is not connected');
        }
        console.info('%c[GazeInputBridgeApiClient] Sending command:', 'color: blue; font-weight: bold', message);
        this.websocket.send(JSON.stringify(message));
    }
} 