import type { GazeInputBridgeWebsocketIncomer, GazeInputBridgeWebsocketIncomerCalibrated, GazeInputBridgeWebsocketIncomerConnected, GazeInputBridgeWebsocketIncomerDisconnected, GazeInputBridgeWebsocketIncomerError, GazeInputBridgeWebsocketIncomerPoint, GazeInputBridgeWebsocketIncomerStarted, GazeInputBridgeWebsocketIncomerStopped } from "./GazeInputBridgeWebsocketIncomer";
import type { GazeInputBridgeWebsocketOutcomer, GazeInputBridgeWebsocketOutcomerConnect } from "./GazeInputBridgeWebsocketOutcomer";

export class GazeInputBridgeWebsocket {
    private socket: WebSocket | null = null;
    private uri: string;

    onConnectedCallback: (data: GazeInputBridgeWebsocketIncomerConnected) => void = this.logToConsole;
    onDisconnectedCallback: (data: GazeInputBridgeWebsocketIncomerDisconnected) => void = this.logToConsole;
    onPointCallback: (data: GazeInputBridgeWebsocketIncomerPoint) => void = this.logToConsole;
    onErrorCallback: (data: GazeInputBridgeWebsocketIncomerError) => void = this.logToConsole;
    onCalibratedCallback: (data: GazeInputBridgeWebsocketIncomerCalibrated) => void = this.logToConsole;
    onStartedCallback: (data: GazeInputBridgeWebsocketIncomerStarted) => void = this.logToConsole;
    onStoppedCallback: (data: GazeInputBridgeWebsocketIncomerStopped) => void = this.logToConsole;

    constructor(uri: string) {
        this.uri = uri;
    }

    /**
     * Main function to send data to the WebSocket server. It can be used to:
     * - connect, disconnect, start, pause, and calibrate the eye tracker.
     * @param data valid data to be sent to the WebSocket server.
     * @returns nothing.
     */
    send(data: GazeInputBridgeWebsocketOutcomer): void {
        if (data.type === 'connect') return this.sendConnect(data);
        this.sendToWebsocket(data);
    }

    private sendConnect(data: GazeInputBridgeWebsocketOutcomerConnect): void {
        this.socket = new WebSocket(this.uri);
        this.socket.onopen = () => {
            this.sendToWebsocket.bind(this, data)();
        }
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onclose = () => this.socket = null;
    }

    private sendToWebsocket(data: GazeInputBridgeWebsocketOutcomer): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.onErrorCallback({ type: 'error', message: 'WebSocket is not open.' });
            this.onDisconnectedCallback({ type: 'disconnected' });
        }
    }

    private handleMessage(event: MessageEvent): void {
        const attributes = JSON.parse(event.data) as GazeInputBridgeWebsocketIncomer;
        switch (attributes.type) {
            case 'point':
                this.onPointCallback(attributes);
                break;
            case 'connected':
                this.onConnectedCallback(attributes);
                break;
            case 'started':
                this.onStartedCallback(attributes);
                break;
            case 'stopped':
                this.onStoppedCallback(attributes);
                break;
            case 'disconnected':
                this.onDisconnectedCallback(attributes);
                break;
            case 'error':
                this.onErrorCallback(attributes);
                break;
            case 'calibrated':
                this.onCalibratedCallback(attributes);
                break;
            default:
                throw new Error('Unknown message type. Received data: ' + JSON.stringify(attributes));
        }   
    }

    private handleError(): void {
        this.onErrorCallback({ type: 'error', message: 'Cannot connect to the Bridge. WebSocket connection error on ' + this.uri });
    }

    logToConsole(data: GazeInputBridgeWebsocketIncomer): void {
        console.log(data);
    }

    close(): void {
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'disconnect' }));
            }
            this.socket.close();
            this.socket = null;
        }
    }
}
