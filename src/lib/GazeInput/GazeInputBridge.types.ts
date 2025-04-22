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
  | 'response'
  | 'status';

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
  type: 'open' | 'close';
}

interface CommandPayloadBase extends CorrelationId, InitiatorId {
  type: CommandType;
}

interface TrackerConfig {
  trackerType: 'gazepoint' | 'eyelogic' | 'asee';
}

interface CommandPayloadConnect extends CommandPayloadBase {
  type: 'connect';
  config: TrackerConfig;
}

export interface CommandPayloadGeneric extends CommandPayloadBase {
  type: Exclude<CommandType, 'connect'>;
}

export type CommandPayload = CommandPayloadConnect | CommandPayloadGeneric;

export interface MessagePayload extends CorrelationId, InitiatorId {
  type: 'message';
  content: string;
}

export interface GazeDataPayload {
  type: 'gaze';
  deviceId: string; // id of the gaze sample from the device
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
  deviceTimestamp: string; // ISO date-time
  timestamp: string; // ISO date-time
}

export interface FixationDataPayload {
  type: 'fixationStart' | 'fixationEnd';
  deviceId: string; // id of the fixation sample from the device
  timestamp: string; // ISO date-time ... if from JS SDK filter, take from the gaze data payload
  deviceTimestamp: string; // ISO date-time ... if from JS SDK filter, take from the gaze data payload
  duration: number; // duration of the fixation in milliseconds
  x: number;
  y: number;
}

/**
 * Type that defines the structure of the status object that is sent to the worker.
 * @example
 * {
 *   status: 'trackerDisconnected',
 *   calibration: '2024-01-01T00:00:00.000Z'
 * }
 */
export interface TrackerStatus {
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
  calibration: string | null; // nullable ISO date-time
}

export interface ResponseStatus {
  to: CommandType;
  status: 'resolved' | 'rejected' | 'processing';
  message: string;
}

export interface ReceiveResponsePayload extends CorrelationId, InitiatorId, Timestamp {
  type: 'response';
  tracker: TrackerStatus;
  response: ResponseStatus;
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

export type ReceiveFromWebSocketMessages = ReceiveResponsePayload | ReceiveMessagePayload | ReceiveErrorPayload | GazeDataPayload | FixationDataPayload;

export type ReceiveFromWorkerMessages = ReceiveFromWebSocketMessages | ReadyPayload;