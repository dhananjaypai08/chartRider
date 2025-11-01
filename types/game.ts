export interface BlockData {
  gasUsed: string;
  size: string;
  timestamp: string;
}

export interface GraphQLResponse {
  data: {
    blocks: BlockData[];
  };
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  blockData: BlockData;
  type: 'normal' | 'meme';
  memeImage?: string;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isGrounded: boolean;
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  score: number;
  time: number;
  isGameOver: boolean;
  gameStarted: boolean;
  cameraX: number;
}

export interface Controls {
  left: boolean;
  right: boolean;
  jump: boolean;
}