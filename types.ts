
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SnazzimonData {
  id: number;
  name: string;
  image: string;
  video: {
    intro: string;
    reveal: string;
    idle: string;
    success: string;
    fail: string;
    outro: string;
  };
}

export interface Checkpoint {
  id: number;
  coordinates: Coordinates;
  snazzimonId: number;
  captureThreshold: number; // in meters
  successProbability: number; // 0.0 to 1.0
  hints: string[];
  hintCooldown: number; // in minutes
}

export enum GameState {
  FTU,
  FIND,
  CAPTURE,
  REPLAY,
  GAME_OVER,
  DEMO,
}
