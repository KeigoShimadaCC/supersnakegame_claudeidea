export interface Vec2 {
  x: number;
  y: number;
}

export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const GameState = {
  Menu: 'menu',
  StageIntro: 'stageIntro',
  Playing: 'playing',
  BossIntro: 'bossIntro',
  Boss: 'boss',
  Paused: 'paused',
  Death: 'death',
  StageComplete: 'stageComplete',
  WorldComplete: 'worldComplete',
  DimensionReveal: 'dimensionReveal',
} as const;
export type GameState = (typeof GameState)[keyof typeof GameState];

export const CubeFace = {
  Front: 0,
  Right: 1,
  Back: 2,
  Left: 3,
  Top: 4,
  Bottom: 5,
} as const;
export type CubeFace = (typeof CubeFace)[keyof typeof CubeFace];

export interface GridCell {
  x: number;
  y: number;
}

export interface SnakeSegment {
  pos: GridCell;
  face: CubeFace;
}

export interface FoodItem {
  pos: GridCell;
  face: CubeFace;
  type: FoodType;
  timeLimit?: number;
  spawnTime?: number;
  dimensionalFaces?: CubeFace[];
}

export const FoodType = {
  Normal: 'normal',
  Speed: 'speed',
  TimeLimited: 'timeLimited',
  Dimensional: 'dimensional',
} as const;
export type FoodType = (typeof FoodType)[keyof typeof FoodType];

export interface Wall {
  pos: GridCell;
  face: CubeFace;
  isMoving?: boolean;
  moveDir?: Direction;
  moveSpeed?: number;
  isTrail?: boolean;
}

export interface StageConfig {
  id: number;
  world: number;
  name: string;
  gridSize: number;
  initialSpeed: number;
  targetScore: number;
  walls: Wall[];
  movingWalls?: boolean;
  speedRamps?: boolean;
  timeLimitedFood?: boolean;
  dimensionalFood?: boolean;
  isBoss?: boolean;
  bossType?: string;
  description: string;
}

export interface GameEvents {
  onEat: () => void;
  onDeath: () => void;
  onStageComplete: () => void;
  onBossDamage: () => void;
  onDimensionFlip: () => void;
  onScoreChange: (score: number) => void;
  onStateChange: (state: GameState) => void;
}

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.Up]: Direction.Down,
  [Direction.Down]: Direction.Up,
  [Direction.Left]: Direction.Right,
  [Direction.Right]: Direction.Left,
};

export const DIRECTION_VECTORS: Record<Direction, Vec2> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
};

export const ADJACENT_FACES: Record<CubeFace, Record<Direction, CubeFace>> = {
  [CubeFace.Front]: {
    [Direction.Up]: CubeFace.Top,
    [Direction.Down]: CubeFace.Bottom,
    [Direction.Left]: CubeFace.Left,
    [Direction.Right]: CubeFace.Right,
  },
  [CubeFace.Right]: {
    [Direction.Up]: CubeFace.Top,
    [Direction.Down]: CubeFace.Bottom,
    [Direction.Left]: CubeFace.Front,
    [Direction.Right]: CubeFace.Back,
  },
  [CubeFace.Back]: {
    [Direction.Up]: CubeFace.Top,
    [Direction.Down]: CubeFace.Bottom,
    [Direction.Left]: CubeFace.Right,
    [Direction.Right]: CubeFace.Left,
  },
  [CubeFace.Left]: {
    [Direction.Up]: CubeFace.Top,
    [Direction.Down]: CubeFace.Bottom,
    [Direction.Left]: CubeFace.Back,
    [Direction.Right]: CubeFace.Front,
  },
  [CubeFace.Top]: {
    [Direction.Up]: CubeFace.Back,
    [Direction.Down]: CubeFace.Front,
    [Direction.Left]: CubeFace.Left,
    [Direction.Right]: CubeFace.Right,
  },
  [CubeFace.Bottom]: {
    [Direction.Up]: CubeFace.Front,
    [Direction.Down]: CubeFace.Back,
    [Direction.Left]: CubeFace.Left,
    [Direction.Right]: CubeFace.Right,
  },
};
