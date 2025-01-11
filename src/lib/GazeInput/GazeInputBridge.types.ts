import type { GazeWindowCalibratorConfig } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";
import type { GazeInputConfigBridge } from "./GazeInputConfig";

export type CommandType =
  | 'subscribe'
  | 'unsubscribe'
  | 'connect'
  | 'disconnect'
  | 'calibrate'
  | 'start'
  | 'stop'
  | 'response';

export type InnerCommandType = CommandType | 'open' | 'close';

interface CorrelationId {
  correlationId: number;
}

interface InitiatorId {
  initiatorId: string;
}

interface Timestamp {
  timestamp: string; // ISO date-time string
}

export interface InnerCommandPayloadBase extends CorrelationId, InitiatorId, Timestamp {
  type: InnerCommandType;
}

interface CommandPayloadBase extends CorrelationId, InitiatorId {
  type: CommandType;
}

interface TrackerConfig {
  trackerType: 'gazepoint' | 'eyelogic';
}

interface CommandPayloadConnect extends CommandPayloadBase {
  type: 'connect';
  config: TrackerConfig;
}

export interface CommandPayloadGeneric extends CommandPayloadBase {
  type: Exclude<CommandType, 'connect' | 'status'>;
}

export type CommandPayload = CommandPayloadConnect | CommandPayloadGeneric;

export interface MessagePayload extends CorrelationId, InitiatorId {
  type: 'message';
  content: string;
}

export interface GazeDataPayload extends Timestamp {
  type: 'gaze';
  // Left eye data
  xL: number;
  yL: number;
  validityL: boolean;
  pupilDiameterL: number;
  // Right eye data
  xR: number;
  yR: number;
  validityR: boolean;
  pupilDiameterR: number;
  // Optional fixation data
  fixationDuration?: number;
  fixationId?: number;
}

export interface GazeInputStatus {
  status:
    | 'trackerDisconnected'
    | 'trackerConnected'
    | 'trackerConnecting'
    | 'trackerCalibrating'
    | 'trackerEmitting';
  /**
   * Time of the last device calibration.
   * Null if unknown, probably not calibrated at all.
   */
  trackerCalibration: string | null; // nullable ISO date-time
}

export interface ReceiveResponsePayload extends CorrelationId, InitiatorId, Timestamp, GazeInputStatus {
  type: 'response';
  responseTo: CommandType;
}

export interface ReceiveMessagePayload extends CorrelationId, InitiatorId, Timestamp {
  type: 'message';
  content: string;
}

export interface ReceiveErrorPayload extends Timestamp {
  type: 'error';
  content: string;
}

export interface ViewportCalibrationPayload extends GazeWindowCalibratorConfig, CorrelationId, InitiatorId {
    type: 'viewportCalibration';
}

export interface SetupPayload extends InitiatorId {
  type: 'setup';
  config: GazeInputConfigBridge;
}

export interface ReadyPayload extends InitiatorId {
  type: 'ready';
}

export type SendToWorkerAsyncMessages = CommandPayload | MessagePayload | ViewportCalibrationPayload | InnerCommandPayloadBase;

export type SendToWorkerSyncMessages = SetupPayload;

export type SendToWorkerMessages = SendToWorkerAsyncMessages | SendToWorkerSyncMessages;

export type ReceiveFromWebSocketMessages = ReceiveResponsePayload | ReceiveMessagePayload | ReceiveErrorPayload | GazeDataPayload;

export type ReceiveFromWorkerMessages = ReceiveFromWebSocketMessages | ReadyPayload;