export type Position = {
  x: number;
  y: number;
};

export interface Aoi {
  id?: number;
  userId: string;
  aoiId: string;
  leftBotPos: Position;
  rightTopPos: Position;
};