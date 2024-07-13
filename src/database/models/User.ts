export interface User {
  id: string;
  resolution: {
    width: number;
    height: number;
  };
  userAgent: string;
  timestamp: number;
};
